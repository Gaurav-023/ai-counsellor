import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar, Button, Alert, CircularProgress } from '@mui/material';
import { supabase } from '../../lib/supabase';
import { getChatHistory, sendMessageToAI, updateStudentProfile, addToShortlist, addTask } from '../../lib/api';
import { SentIcon, BubbleChatIcon, Delete02Icon } from 'hugeicons-react';
import { events } from '../../lib/events';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
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

            // Send to API (which saves to DB and calls Edge Function)
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

                    // Remove from view
                    displayText = displayText.replace(match[0], '').trim();

                    // Execute Actions
                    if (action.type === 'update_profile') {
                        await updateStudentProfile(action.data);
                        setActionFeedback("Profile updated successfully!");
                        events.emit(); // Refresh other components
                    } else if (action.type === 'shortlist') {
                        if (action.data.university_id && action.data.university_id !== '[UUID_HERE]') {
                            await addToShortlist(action.data.university_id, action.data.category || 'Target');
                            setActionFeedback("University added to shortlist!");
                        }
                    } else if (action.type === 'add_task') {
                        await addTask(action.data.text);
                        setActionFeedback("Task added to your checklist!");
                    } else if (action.type === 'set_filter') {
                        // For counselor page, maybe just say "I've noted your preference" or
                        // redirect user? For now, just feedback.
                        setActionFeedback("Search filters updated.");
                    }

                    // Clear feedback after 3s
                    setTimeout(() => setActionFeedback(null), 3000);

                } catch (e) {
                    console.error("Failed to parse action", e);
                }
            }

            // Update State with real messages from DB (replacing optimistic)
            // Actually, getChatHistory returns sorted by time, so maybe just reloading or appending is safer.
            // But api returns the inserted rows.

            // To be safe and clean, let's just use the returned messages
            // Replace the last optimistic message and add AI response
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempId);
                return [
                    ...filtered,
                    { ...userMsg, content: userMsg.content },
                    { ...aiMsg, content: displayText } // Use cleaned text
                ];
            });

        } catch (error) {
            console.error("Chat Error:", error);
            // Append error message
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
        <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.02)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#6366f1' }}><BubbleChatIcon size={20} /></Avatar>
                    <Box>
                        <Typography variant="subtitle1" color="white" fontWeight="700">AI Counselor</Typography>
                        <Typography variant="caption" color="#94a3b8">Always here to help you.</Typography>
                    </Box>
                </Box>
                <IconButton onClick={handleClearChat} size="small" sx={{ color: '#64748b', '&:hover': { color: '#ef4444' } }}>
                    <Delete02Icon size={18} />
                </IconButton>
            </Box>

            {/* Action Feedback Toast */}
            {actionFeedback && (
                <Box sx={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                    <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                        {actionFeedback}
                    </Alert>
                </Box>
            )}

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {messages.length === 0 && !loading && (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5 }}>
                        <BubbleChatIcon size={48} color="#64748b" />
                        <Typography color="#64748b" mt={2}>Ask me anything about universities, applications, or your profile.</Typography>
                    </Box>
                )}

                {messages.map((msg, index) => (
                    <Box
                        key={msg.id || index}
                        sx={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        {msg.role === 'assistant' && (
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366f1', mr: 2, mt: 0.5, fontSize: '0.8rem' }}>AI</Avatar>
                        )}
                        <Paper sx={{
                            p: 2,
                            maxWidth: '75%',
                            borderRadius: 3,
                            bgcolor: msg.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.08)',
                            color: 'white',
                            borderTopRightRadius: msg.role === 'user' ? 0 : 3,
                            borderTopLeftRadius: msg.role === 'assistant' ? 0 : 3,
                            boxShadow: 'none'
                        }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
                        </Paper>
                    </Box>
                ))}

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', ml: 6 }}>
                        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.08)', borderTopLeftRadius: 0 }}>
                            <span className="loader"></span>
                        </Paper>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    bgcolor: 'rgba(0,0,0,0.2)',
                    p: 1,
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'border-color 0.2s',
                    '&:focus-within': { borderColor: '#6366f1' }
                }}>
                    <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        InputProps={{ disableUnderline: true, sx: { color: 'white', px: 2 } }}
                        disabled={loading}
                        autoComplete="off"
                    />
                    <IconButton
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        sx={{
                            color: 'white',
                            bgcolor: input.trim() ? '#6366f1' : 'rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#4f46e5' },
                            '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
                        }}
                    >
                        <SentIcon size={20} />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default AICounselorPage;
