import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar, Fade, Alert } from '@mui/material';
import { supabase } from '../../lib/supabase';
import { getChatHistory, sendMessageToAI, updateStudentProfile, addToShortlist, addTask } from '../../lib/api';
import { SentIcon, Delete02Icon, SparklesIcon } from 'hugeicons-react'; // Updated icons
import { events } from '../../lib/events';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant'; // API uses 'assistant', UI displays 'ai' styled
    created_at: string;
}

const AICounselorPage = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [actionFeedback, setActionFeedback] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const history = await getChatHistory();
            setMessages(history);
        } catch (error) {
            console.error("Failed to load chat history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userText = input.trim();
        setInput('');
        setLoading(true);

        try {
            // Optimistic Update
            const tempId = Date.now().toString();
            setMessages(prev => [...prev, {
                id: tempId,
                content: userText,
                role: 'user',
                created_at: new Date().toISOString()
            }]);

            // Send to API
            const [userMsg, aiMsg] = await sendMessageToAI(userText);

            // Strip Action Blocks from Display
            let displayText = aiMsg.content;
            const actionRegex = /<<<ACTION(.*?)>>>/s;
            const match = displayText.match(actionRegex);

            if (match) {
                const actionJson = match[1];
                try {
                    const action = JSON.parse(actionJson);
                    console.log("COUNSELOR ACTION:", action);

                    displayText = displayText.replace(match[0], '').trim();

                    if (action.type === 'update_profile') {
                        await updateStudentProfile(action.data);
                        setActionFeedback("Profile updated successfully!");
                        events.emit();
                    } else if (action.type === 'shortlist') {
                        if (action.data.university_id && action.data.university_id !== '[UUID_HERE]') {
                            await addToShortlist(action.data.university_id, action.data.category || 'Target');
                            setActionFeedback("University added to shortlist!");
                        }
                    } else if (action.type === 'add_task') {
                        await addTask(action.data.text);
                        setActionFeedback("Task added to your checklist!");
                    } else if (action.type === 'set_filter') {
                        setActionFeedback("Search filters updated.");
                    }

                    setTimeout(() => setActionFeedback(null), 3000);

                } catch (e) {
                    console.error("Failed to parse action", e);
                }
            }

            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId);
                return [
                    ...filtered,
                    { ...userMsg, content: userMsg.content },
                    { ...aiMsg, content: displayText }
                ];
            });

        } catch (error) {
            console.error("Chat Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = async () => {
        if (window.confirm("Are you sure you want to clear the chat history?")) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('chat_messages').delete().eq('user_id', user.id);
                setMessages([]);
            }
        }
    }

    return (
        <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC', borderRadius: 4, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>

            {/* Header with Glassmorphism */}
            <Box sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10
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
                                Online • Ready to help
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <IconButton onClick={handleClearChat} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                    <Delete02Icon size={18} />
                </IconButton>
            </Box>

            {/* Action Feedback Toast */}
            {actionFeedback && (
                <Box sx={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <Alert severity="success" variant="filled" sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        {actionFeedback}
                    </Alert>
                </Box>
            )}

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#F8FAFC' }}>
                {messages.length === 0 && !loading && (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <Paper elevation={0} sx={{
                            p: 4,
                            maxWidth: 480,
                            width: '90%',
                            borderRadius: 4,
                            bgcolor: 'white',
                            border: '1px solid #E2E8F0',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Box sx={{
                                width: 64, height: 64, borderRadius: '50%', bgcolor: '#EEF2FF', color: '#4F46E5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, border: '1px solid #E0E7FF'
                            }}>
                                <SparklesIcon size={32} />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight="800" color="#1E293B" gutterBottom>
                                    Welcome to your AI Counselor
                                </Typography>
                                <Typography variant="body1" color="#64748B" sx={{ lineHeight: 1.6 }}>
                                    I'm here to help you navigate your academic journey. Ask me about universities, application deadlines, or get personalized feedback on your profile.
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
                                {['Review my profile', 'Suggest dream universities', 'Scholarship options'].map((suggestion) => (
                                    <Box key={suggestion} onClick={() => setInput(suggestion)} sx={{
                                        px: 2, py: 1, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2,
                                        color: '#475569', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                        '&:hover': { bgcolor: '#F1F5F9', color: '#1E293B', borderColor: '#CBD5E1' },
                                        transition: 'all 0.2s'
                                    }}>
                                        {suggestion}
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Box>
                )}

                {messages.map((msg, index) => (
                    <Fade in={true} key={msg.id || index}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                width: '100%',
                            }}
                        >
                            <Box sx={{
                                maxWidth: '75%',
                                display: 'flex',
                                gap: 1.5,
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                            }}>
                                {msg.role === 'assistant' && (
                                    <Avatar sx={{
                                        width: 32, height: 32,
                                        bgcolor: 'white',
                                        border: '1px solid #E2E8F0',
                                        color: '#4F46E5',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        mt: 0.5
                                    }}>
                                        <SparklesIcon size={16} />
                                    </Avatar>
                                )}

                                <Paper elevation={0} sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: msg.role === 'user' ? '#4F46E5' : 'white',
                                    color: msg.role === 'user' ? 'white' : '#1E293B',
                                    borderTopRightRadius: msg.role === 'user' ? 4 : 20,
                                    borderTopLeftRadius: msg.role === 'assistant' ? 4 : 20,
                                    boxShadow: msg.role === 'user'
                                        ? '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                                        : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                    border: msg.role === 'assistant' ? '1px solid #F1F5F9' : 'none',
                                    '& p': { m: 0, lineHeight: 1.6 },
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>{msg.content}</Typography>
                                </Paper>
                            </Box>
                        </Box>
                    </Fade>
                ))}

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', ml: 6 }}>
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
                p: 3,
                bgcolor: 'transparent',
                pointerEvents: 'none'
            }}>
                <Paper
                    elevation={4}
                    sx={{
                        pointerEvents: 'auto',
                        display: 'flex',
                        gap: 2,
                        bgcolor: 'white',
                        p: 1, // Compact padding
                        pl: 2.5,
                        borderRadius: 8,
                        width: '100%',
                        alignItems: 'center',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        InputProps={{
                            disableUnderline: true,
                            sx: { color: '#0F172A', fontSize: '0.95rem' }
                        }}
                        disabled={loading}
                        autoComplete="off"
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        sx={{
                            color: 'white',
                            bgcolor: '#4F46E5',
                            width: 40,
                            height: 40,
                            '&:hover': { bgcolor: '#4338CA' },
                            '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
                            transition: 'all 0.2s'
                        }}
                    >
                        <SentIcon size={20} />
                    </IconButton>
                </Paper>
            </Box>
        </Box>
    );
};

export default AICounselorPage;
