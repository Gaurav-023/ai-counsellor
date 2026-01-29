import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { updateStudentProfile } from '../../lib/api';
import { SentIcon, BubbleChatIcon, ArrowRight01Icon } from 'hugeicons-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const AIOnboardingPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [profileUpdates, setProfileUpdates] = useState<string[]>([]); // To show visual feedback

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial greeting
    useEffect(() => {
        const initChat = async () => {
            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Add initial message
            setMessages([{
                id: 'init',
                text: "**Hi there! I'm your AI Counselor.** 👋\n\nI'm here to help you build your profile so we can find your dream university. To get started, could you please tell me your **full name**?",
                sender: 'ai',
                timestamp: new Date()
            }]);
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
                // Parse for Actions
                let replyText = data.reply;
                const actionRegex = /<<<ACTION(.*?)>>>/s;
                const match = replyText.match(actionRegex);

                if (match) {
                    const actionJson = match[1];
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

            // Check for completion heuristic (optional, or just let user click finish)
            if (data.gpa || data.degree_major || data.budget_range) {
                // Maybe enable finish button?
            }

        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    const handleFinish = async () => {
        // Mark onboarding as complete in profiles table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({ is_onboarding_complete: true }).eq('id', user.id);
        }
        navigate('/dashboard');
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#0f172a' }}>
            {/* Left Panel: Context/Status */}
            <Box sx={{ width: 300, borderRight: '1px solid rgba(255,255,255,0.1)', p: 3, display: { xs: 'none', md: 'block' } }}>
                <Typography variant="h6" color="white" fontWeight="bold" gutterBottom>
                    Profile Status
                </Typography>
                <Typography variant="body2" color="#94a3b8" sx={{ mb: 4 }}>
                    Chat with me to fill details.
                </Typography>

                {/* Hidden ticks as requested */}
                {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {profileUpdates.map((update, i) => (
                        <Alert key={i} severity="success" variant="filled" sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                            {update}
                        </Alert>
                    ))}
                </Box> */}

                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 'auto', bgcolor: '#6366f1' }}
                    onClick={handleFinish}
                >
                    Finish & Go to Dashboard
                </Button>
            </Box>

            {/* Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#6366f1' }}><BubbleChatIcon size={20} /></Avatar>
                        <Typography variant="subtitle1" color="white" fontWeight="600">AI Counselor</Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowRight01Icon />}
                        onClick={handleFinish}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', display: { md: 'none' } }}
                    >
                        Finish
                    </Button>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {messages.map((msg) => (
                        <Box
                            key={msg.id}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <Paper sx={{
                                p: 2,
                                maxWidth: '75%', // Increased slightly
                                borderRadius: 3,
                                bgcolor: msg.sender === 'user' ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                borderTopRightRadius: msg.sender === 'user' ? 0 : 3,
                                borderTopLeftRadius: msg.sender === 'ai' ? 0 : 3,
                                '& p': { m: 0, lineHeight: 1.6 }, // Remove default p margins, better line height
                                '& ul, & ol': { pl: 2.5, my: 1 }, // Indent lists
                                '& li': { mb: 0.5 }, // Space list items
                                '& strong': { color: msg.sender === 'user' ? 'white' : '#818cf8', fontWeight: 600 } // Highlight bold text
                            }}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </Paper>
                        </Box>
                    ))}
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', borderTopLeftRadius: 0 }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Thinking...</Typography>
                            </Paper>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        p: 1,
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <TextField
                            fullWidth
                            variant="standard"
                            placeholder="Type your answer..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            InputProps={{ disableUnderline: true, sx: { color: 'white', px: 2 } }}
                            disabled={loading}
                        />
                        <IconButton
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)' }}
                        >
                            <SentIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AIOnboardingPage;
