import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar, Button, LinearProgress, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { updateStudentProfile } from '../../lib/api';
import { SentIcon, ArrowRight01Icon, Tick02Icon, SparklesIcon } from 'hugeicons-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ProfileCompletionStatus {
    hasEducationLevel: boolean;
    hasDegreeMajor: boolean;
    hasGraduationYear: boolean;
    hasGPA: boolean;
    hasIntendedDegree: boolean;
    hasFieldOfStudy: boolean;
    hasPreferredCountries: boolean;
    hasBudgetRange: boolean;
    hasFundingSource: boolean;
}

const AIOnboardingPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [, setProfileUpdates] = useState<string[]>([]);

    // ✨ NEW: Completion tracking
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [profileStatus, setProfileStatus] = useState<ProfileCompletionStatus>({
        hasEducationLevel: false,
        hasDegreeMajor: false,
        hasGraduationYear: false,
        hasGPA: false,
        hasIntendedDegree: false,
        hasFieldOfStudy: false,
        hasPreferredCountries: false,
        hasBudgetRange: false,
        hasFundingSource: false,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ✨ Check profile completion status
    const checkProfileCompletion = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            const status = {
                hasEducationLevel: !!profile.education_level,
                hasDegreeMajor: !!profile.degree_major,
                hasGraduationYear: !!profile.graduation_year,
                hasGPA: !!profile.gpa,
                hasIntendedDegree: !!profile.intended_degree,
                hasFieldOfStudy: !!profile.field_of_study,
                hasPreferredCountries: !!(profile.preferred_countries && profile.preferred_countries.length > 0),
                hasBudgetRange: !!profile.budget_range,
                hasFundingSource: !!profile.funding_source,
            };

            setProfileStatus(status);

            // Calculate completion percentage
            const totalFields = Object.keys(status).length;
            const filledFields = Object.values(status).filter(Boolean).length;
            const percentage = Math.round((filledFields / totalFields) * 100);
            setCompletionPercentage(percentage);

            // Check if profile is complete (at least 80% filled)
            const isComplete = percentage >= 80;
            setIsProfileComplete(isComplete);

            // ✨ Auto-show completion message when profile is complete
            if (isComplete && messages.length > 0 && messages[messages.length - 1].sender === 'user') {
                setTimeout(() => {
                    // Only add if not already added
                    const lastMsg = messages[messages.length - 1];
                    if (!lastMsg.id.includes('complete')) {
                        setMessages(prev => [...prev, {
                            id: Date.now().toString() + '_complete',
                            text: "🎉 **Excellent! Your profile is now complete!**\n\nYou've provided all the essential information. You can now head to your **Dashboard** to:\n\n✅ Browse personalized university recommendations\n✅ Build your shortlist\n✅ Track your application tasks\n\nClick the **'Go to Dashboard'** button whenever you're ready!",
                            sender: 'ai',
                            timestamp: new Date()
                        }]);
                    }
                }, 1000);
            }
        }
    };

    // Initial greeting
    useEffect(() => {
        const initChat = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Check existing profile first
            await checkProfileCompletion();

            // Add initial message
            if (messages.length === 0) {
                setMessages([{
                    id: 'init',
                    text: "**Hi there! I'm your AI Counselor.** 👋\n\nI'm here to help you build your profile so we can find your dream university. To get started, could you please tell me your **full name**?",
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            }
        };
        initChat();
    }, [navigate]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userText = input.trim();
        setInput('');

        // Add User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-counsellor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ message: userText })
            });

            const data = await response.json();

            if (data.reply) {
                // Parse for actions
                let replyText = data.reply;
                const actionRegex = /<<<ACTION(.*?)>>>/s;
                const match = replyText.match(actionRegex);

                if (match) {
                    let actionJson = match[1];
                    // Clean up potential markdown code blocks
                    actionJson = actionJson.replace(/```json/g, '').replace(/```/g, '').trim();

                    try {
                        const action = JSON.parse(actionJson);
                        console.log("AI ACTION DETECTED:", action);

                        // Remove action block from display text
                        replyText = replyText.replace(match[0], '').trim();

                        // Handle Update Profile
                        if (action.type === 'update_profile') {
                            await handleProfileUpdate(action.data);
                        }
                    } catch (e) {
                        console.error("Failed to parse action JSON", e);
                    }
                }

                // Add AI Message
                setMessages(prev => [...prev, {
                    id: Date.now().toString() + '_ai',
                    text: replyText,
                    sender: 'ai',
                    timestamp: new Date()
                }]);
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString() + '_err',
                text: "I'm having trouble connecting right now. Please try again.",
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (data: any) => {
        try {
            console.log("Updating Profile with:", data);
            await updateStudentProfile(data);

            // Visual Feedback
            const keys = Object.keys(data).join(", ");
            setProfileUpdates(prev => [...prev, `Updated: ${keys}`]);

            // ✨ Check completion after update
            await checkProfileCompletion();

        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    const handleFinish = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({ is_onboarding_complete: true }).eq('id', user.id);
        }
        navigate('/dashboard');
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F8FAFC' }}>
            {/* Left Panel: Sidebar (Context & Progress) */}
            <Paper
                elevation={0}
                sx={{
                    width: 320,
                    borderRight: '1px solid #E2E8F0',
                    p: 4,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    bgcolor: 'white',
                    zIndex: 2
                }}
            >
                <Typography variant="h5" fontWeight="800" color="#1E293B" gutterBottom sx={{ letterSpacing: '-0.5px' }}>
                    Profile Setup
                </Typography>
                <Typography variant="body2" color="#64748B" sx={{ mb: 4 }}>
                    Your personal AI counselor is helping you build the perfect university application profile.
                </Typography>

                {/* Progress Card */}
                <Paper
                    variant="outlined"
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        bgcolor: '#F8FAFC',
                        border: '1px solid #F1F5F9'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight="600" color="#334155">
                            Completion
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold" color={isProfileComplete ? "#10B981" : "#6366F1"}>
                            {completionPercentage}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={completionPercentage}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#E2E8F0',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: isProfileComplete ? '#10B981' : '#6366F1',
                                borderRadius: 4
                            }
                        }}
                    />
                </Paper>

                {/* Checklist */}
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="#94A3B8" sx={{ mb: 2, display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Key Details
                    </Typography>
                    {[
                        { key: 'hasEducationLevel', label: 'Education Level' },
                        { key: 'hasIntendedDegree', label: 'Target Degree' },
                        { key: 'hasDegreeMajor', label: 'Major / Field' },
                        { key: 'hasGPA', label: 'Academic Score (GPA)' },
                        { key: 'hasPreferredCountries', label: 'Preferred Countries' },
                        { key: 'hasBudgetRange', label: 'Budget Range' },
                        { key: 'hasFundingSource', label: 'Funding Source' },
                    ].map(({ key, label }) => (
                        <Box
                            key={key}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                mb: 2,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: profileStatus[key as keyof ProfileCompletionStatus] ? '#ECFDF5' : '#F1F5F9',
                                border: profileStatus[key as keyof ProfileCompletionStatus] ? '1px solid #10B981' : '1px solid #E2E8F0',
                                color: profileStatus[key as keyof ProfileCompletionStatus] ? '#10B981' : '#CBD5E1'
                            }}>
                                <Tick02Icon size={14} />
                            </Box>
                            <Typography
                                variant="body2"
                                fontWeight={profileStatus[key as keyof ProfileCompletionStatus] ? 600 : 400}
                                color={profileStatus[key as keyof ProfileCompletionStatus] ? "#334155" : "#94A3B8"}
                                sx={{ transition: 'color 0.2s' }}
                            >
                                {label}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                        mt: 2,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        boxShadow: isProfileComplete ? '0 10px 20px -10px rgba(15, 23, 42, 0.4)' : 'none',
                        bgcolor: isProfileComplete ? '#0F172A' : '#F1F5F9',
                        color: isProfileComplete ? 'white' : '#94A3B8',
                        '&:hover': {
                            bgcolor: isProfileComplete ? '#1E293B' : '#E2E8F0',
                            boxShadow: isProfileComplete ? '0 15px 25px -10px rgba(15, 23, 42, 0.5)' : 'none',
                        },
                    }}
                    onClick={handleFinish}
                    disabled={completionPercentage < 30}
                    disableElevation
                >
                    {isProfileComplete ? 'Finish & Go to Dashboard' : 'Finish Later'}
                </Button>
            </Paper>

            {/* Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Header (Desktop & Mobile) */}
                <Box sx={{
                    p: 3,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                            bgcolor: '#EEF2FF',
                            color: '#4F46E5',
                            width: 40,
                            height: 40,
                            border: '1px solid #E0E7FF'
                        }}>
                            <SparklesIcon size={20} />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="700" color="#1E293B" sx={{ lineHeight: 1.2 }}>
                                Personalized AI Assistant
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981' }} />
                                <Typography variant="caption" color="#64748B" fontWeight="500">
                                    Online • {completionPercentage}% Profile Completed
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Button
                        size="small"
                        variant="outlined"
                        endIcon={<ArrowRight01Icon />}
                        onClick={handleFinish}
                        disabled={completionPercentage < 30}
                        sx={{
                            color: '#4F46E5',
                            borderColor: '#E2E8F0',
                            display: { xs: 'flex', md: 'none' }
                        }}
                    >
                        Finish
                    </Button>
                </Box>

                {/* Messages Feed */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#F8FAFC' }}>

                    {/* Welcome Banner in Chat */}
                    {messages.length < 2 && (
                        <Fade in={true} timeout={1000}>
                            <Box sx={{ textAlign: 'center', py: 4, opacity: 0.8 }}>
                                <Box sx={{
                                    width: 64, height: 64, borderRadius: '50%', bgcolor: '#E0E7FF', color: '#4F46E5',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 2
                                }}>
                                    <SparklesIcon size={32} />
                                </Box>
                                <Typography variant="body2" color="#64748B">
                                    AI Counselor is ready to help.
                                </Typography>
                            </Box>
                        </Fade>
                    )}

                    {messages.map((msg) => (
                        <Fade in={true} key={msg.id}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    mb: 2,
                                    width: '100%',
                                }}
                            >
                                <Box sx={{
                                    maxWidth: { xs: '85%', md: '70%' },
                                    display: 'flex',
                                    gap: 1.5,
                                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                                }}>
                                    {msg.sender === 'ai' && (
                                        <Avatar sx={{
                                            width: 36, height: 36,
                                            bgcolor: 'white',
                                            border: '1px solid #E2E8F0',
                                            color: '#4F46E5',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            <SparklesIcon size={18} />
                                        </Avatar>
                                    )}

                                    <Paper elevation={0} sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        bgcolor: msg.sender === 'user' ? '#4F46E5' : 'white',
                                        color: msg.sender === 'user' ? 'white' : '#1E293B',
                                        borderTopRightRadius: msg.sender === 'user' ? 4 : 24,
                                        borderTopLeftRadius: msg.sender === 'ai' ? 4 : 24,
                                        boxShadow: msg.sender === 'user'
                                            ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                                            : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                        border: msg.sender === 'ai' ? '1px solid #F1F5F9' : 'none',
                                        '& p': { m: 0, lineHeight: 1.7, fontSize: '0.95rem' },
                                        '& ul, & ol': { pl: 2.5, my: 1.5 },
                                        '& li': { mb: 0.5 },
                                        '& strong': { color: msg.sender === 'user' ? 'white' : '#4F46E5', fontWeight: 600 }
                                    }}>
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </Paper>
                                </Box>
                            </Box>
                        </Fade>
                    ))}

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', ml: 7 }}>
                            <Paper elevation={0} sx={{
                                px: 3, py: 2, borderRadius: 3, bgcolor: 'white', borderTopLeftRadius: 4,
                                border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <span className="loader"></span>
                            </Paper>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{
                    p: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    bgcolor: 'transparent',
                    pointerEvents: 'none' // Let clicks pass through transparent area
                }}>
                    <Paper
                        elevation={4}
                        sx={{
                            pointerEvents: 'auto',
                            display: 'flex',
                            gap: 2,
                            bgcolor: 'white',
                            p: 1.5,
                            pl: 3,
                            borderRadius: 8,
                            width: '100%',
                            maxWidth: 800,
                            alignItems: 'center',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                    >
                        <TextField
                            fullWidth
                            variant="standard"
                            placeholder="Type your answer here..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            InputProps={{
                                disableUnderline: true,
                                sx: {
                                    color: '#0F172A',
                                    fontSize: '1rem'
                                }
                            }}
                            disabled={loading}
                        />
                        <IconButton
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            sx={{
                                color: 'white',
                                bgcolor: '#4F46E5',
                                width: 48,
                                height: 48,
                                '&:hover': { bgcolor: '#4338CA' },
                                '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
                                transition: 'all 0.2s'
                            }}
                        >
                            <SentIcon size={24} />
                        </IconButton>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default AIOnboardingPage;