
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Avatar, Fade, Alert, Tooltip, Skeleton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { supabase } from '../../lib/supabase';
import { getChatHistory, sendMessageToAI, updateStudentProfile, addToShortlist, addTask, getStudentProfile } from '../../lib/api';
import { SentIcon, Delete02Icon, BotIcon, VolumeHighIcon, Mic01Icon, Mic02Icon, StopCircleIcon, Cancel01Icon } from 'hugeicons-react';
import { events } from '../../lib/events';
import ReactMarkdown from 'react-markdown';

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
    const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
    const [userName, setUserName] = useState<string>('Student');
    const [isListening, setIsListening] = useState(false);
    const [micPermissionDenied, setMicPermissionDenied] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Speech Recognition Setup
    const recognitionRef = useRef<any>(null);
    const shouldSendRef = useRef<boolean>(true);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        loadHistory();
        fetchUserName();
        setupSpeechRecognition();

        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const setupSpeechRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);

                if (transcript.trim() && shouldSendRef.current) {
                    handleSend(transcript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                    setMicPermissionDenied(true);
                    setFeedbackType('error');
                    setActionFeedback("Microphone access denied. Please allow usage in your browser settings.");
                } else if (event.error === 'no-speech' || event.error === 'aborted') {
                    // Ignore
                } else {
                    setFeedbackType('error');
                    setActionFeedback("Microphone error: " + event.error);
                }
                setTimeout(() => setActionFeedback(null), 5000);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    };

    const fetchUserName = async () => {
        try {
            const profile = await getStudentProfile();
            if (profile && profile.full_name) {
                const firstName = profile.full_name.split(' ')[0];
                setUserName(firstName);
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        }
    };

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

    const handleSend = async (manualText?: string) => {
        const textToSend = manualText || input;
        if (!textToSend.trim() || loading) return;

        setInput('');
        setLoading(true);

        try {
            const tempId = Date.now().toString();
            setMessages(prev => [...prev, {
                id: tempId,
                content: textToSend,
                role: 'user',
                created_at: new Date().toISOString()
            }]);

            const [userMsg, aiMsg] = await sendMessageToAI(textToSend);

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
                        setFeedbackType('success');
                        setActionFeedback("Profile updated successfully!");
                        events.emit();
                    } else if (action.type === 'shortlist') {
                        if (action.data.university_id && action.data.university_id !== '[UUID_HERE]') {
                            await addToShortlist(action.data.university_id, action.data.category || 'Target');
                            setFeedbackType('success');
                            setActionFeedback("University added to shortlist!");
                        }
                    } else if (action.type === 'add_task') {
                        await addTask(action.data.text);
                        setFeedbackType('success');
                        setActionFeedback("Task added to your checklist!");
                    } else if (action.type === 'set_filter') {
                        setFeedbackType('success');
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

            if (aiMsg.id) {
                handleSpeak(displayText, aiMsg.id);
            } else {
                handleSpeak(displayText, 'temp-ai-response');
            }

        } catch (error) {
            console.error("Chat Error:", error);
            setFeedbackType('error');
            setActionFeedback("Failed to send message. Please try again.");
            setTimeout(() => setActionFeedback(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDeleteChat = async () => {
        setDeleteDialogOpen(false);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('chat_messages').delete().eq('user_id', user.id);
                setMessages([]);
                setFeedbackType('success');
                setActionFeedback("Chat deleted successfully");
                setTimeout(() => setActionFeedback(null), 3000);
            }
        } catch (error) {
            console.error("Failed to delete chat", error);
            setFeedbackType('error');
            setActionFeedback("Failed to delete chat history");
        }
    };

    const handleSpeak = (text: string, msgId: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            if (speakingMessageId === msgId) {
                setSpeakingMessageId(null);
                return;
            }

            const cleanText = text.replace(/[*_#`]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onstart = () => setSpeakingMessageId(msgId);
            utterance.onend = () => setSpeakingMessageId(null);
            utterance.onerror = () => setSpeakingMessageId(null);

            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
        }
    };

    const handleMicClick = () => {
        if (!recognitionRef.current) {
            setFeedbackType('error');
            setActionFeedback("Speech recognition not supported in this browser.");
            setTimeout(() => setActionFeedback(null), 3000);
            return;
        }

        if (micPermissionDenied) {
            setFeedbackType('error');
            setActionFeedback("Microphone access is blocked. Please reset permissions in your address bar.");
            setTimeout(() => setActionFeedback(null), 5000);
            return;
        }

        if (isListening) {
            shouldSendRef.current = true;
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            if (speakingMessageId) stopSpeaking();
            shouldSendRef.current = true;
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Failed to start recording:", e);
                setIsListening(false);
            }
        }
    };

    const cancelRecording = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (recognitionRef.current) {
            shouldSendRef.current = false;
            recognitionRef.current.abort();
            setIsListening(false);
            setInput('');
        }
    };

    return (
        <Box sx={{
            height: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#FFFFFF',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 50px -12px rgba(0,0,0,0.1)',
            border: '1px solid #F1F5F9',
            position: 'relative',
            m: { xs: 1, md: 3 },
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        }}>

            {/* Header */}
            <Box sx={{
                px: 3, py: 3,
                bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(241, 245, 249, 1)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                position: 'sticky', top: 0, zIndex: 10,
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="700" color="#0F172A" sx={{ lineHeight: 1.2, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
                        AI Counselor
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                        <Box sx={{
                            width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981',
                            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)', animation: 'pulse-dot 2s infinite'
                        }} />
                        <Typography variant="caption" color="#64748B" fontWeight="600">
                            Active & Ready
                        </Typography>
                    </Box>
                </Box>

                {/* Right Actions */}
                <Box sx={{ position: 'absolute', right: 24, display: 'flex', gap: 1 }}>
                    <Tooltip title="Clear Chat History">
                        <IconButton onClick={handleClearChat} size="small" sx={{
                            color: '#94A3B8', borderRadius: 3,
                            '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' }, transition: 'all 0.2s'
                        }}>
                            <Delete02Icon size={20} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Toast */}
            <Fade in={!!actionFeedback}>
                <Box sx={{ position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: '90%', maxWidth: 420 }}>
                    <Alert severity={feedbackType} variant="filled" sx={{
                        borderRadius: 4, bgcolor: feedbackType === 'error' ? '#EF4444' : '#0F172A', color: 'white', fontWeight: 500,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {actionFeedback}
                    </Alert>
                </Box>
            </Fade>

            {/* Messages */}
            <Box sx={{
                flex: 1, overflowY: 'auto', p: { xs: 2.5, md: 4 },
                display: 'flex', flexDirection: 'column', gap: 4, bgcolor: '#FAFAFA'
            }}>
                {/* ... (Previous visual code for empty state and messages) ... */}
                {/* Kept exactly as is to preserve visuals */}
                {messages.length === 0 && !loading && (
                    <Fade in={true} timeout={1000}>
                        <Box sx={{
                            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pb: 8
                        }}>
                            <BotIcon size={80} color="#2563EB" style={{ marginBottom: 40 }} />

                            <Typography variant="h3" fontWeight="600" color="#0F172A" gutterBottom sx={{ textAlign: 'center', letterSpacing: '-0.03em', fontSize: { xs: '2rem', md: '2.75rem' } }}>
                                Welcome, {userName}
                            </Typography>
                            <Typography variant="body1" color="#64748B" sx={{ textAlign: 'center', maxWidth: 440, lineHeight: 1.8, mb: 6, fontSize: '1.1rem' }}>
                                I'm excited to help you plan your future. Tap the microphone to start speaking or choose a topic below.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 650 }}>
                                {['Review my profile', 'Explore Universities', 'Scholarship Advice', 'Application Tips'].map((suggestion) => (
                                    <Paper key={suggestion} elevation={0} onClick={() => handleSend(suggestion)} sx={{
                                        px: 3, py: 1.5, bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 100,
                                        color: '#475569', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.06)', borderColor: '#94A3B8', color: '#0F172A' }
                                    }}>
                                        {suggestion}
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    </Fade>
                )}

                {messages.map((msg, index) => (
                    <Fade in={true} key={msg.id || index}>
                        <Box sx={{
                            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', width: '100%',
                        }}>
                            <Box sx={{
                                maxWidth: '85%', display: 'flex', gap: 2.5, alignItems: 'flex-start',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                            }}>
                                {msg.role === 'assistant' && (
                                    <Avatar sx={{
                                        width: 38, height: 38, bgcolor: 'white', border: '1px solid #E2E8F0',
                                        color: '#6366F1', mt: 0.5, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                                    }}>
                                        <BotIcon size={20} />
                                    </Avatar>
                                )}

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Paper elevation={0} sx={{
                                        p: 3, borderRadius: 4, bgcolor: msg.role === 'user' ? '#1E293B' : 'white',
                                        color: msg.role === 'user' ? '#F8FAFC' : '#1E293B',
                                        borderTopRightRadius: msg.role === 'user' ? 4 : 24,
                                        borderTopLeftRadius: msg.role === 'assistant' ? 4 : 24,
                                        boxShadow: msg.role === 'user'
                                            ? '0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)'
                                            : '0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
                                        border: msg.role === 'assistant' ? '1px solid #F1F5F9' : 'none',
                                    }}>
                                        <Box sx={{
                                            '& p': { m: 0, mb: 1.5, lineHeight: 1.7 },
                                            '& p:last-child': { mb: 0 },
                                            '& strong': { fontWeight: 600, color: msg.role === 'user' ? 'white' : '#0F172A' },
                                            '& ul, & ol': { pl: 2.5, mb: 1.5 },
                                            '& li': { mb: 0.5 },
                                            '& h1, & h2, & h3': { fontWeight: 700, mt: 2, mb: 1, lineHeight: 1.3 },
                                            '& h1': { fontSize: '1.25rem' },
                                            '& h2': { fontSize: '1.15rem' },
                                            '& code': {
                                                bgcolor: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : '#F1F5F9',
                                                p: '2px 6px', borderRadius: 1, fontSize: '0.9em', fontFamily: 'monospace'
                                            },
                                            '& pre': {
                                                bgcolor: msg.role === 'user' ? 'rgba(0,0,0,0.3)' : '#F8FAFC',
                                                p: 2, borderRadius: 2, overflowX: 'auto',
                                                border: msg.role === 'assistant' ? '1px solid #E2E8F0' : 'none'
                                            }
                                        }}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </Box>
                                    </Paper>

                                    {msg.role === 'assistant' && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 1 }}>
                                            <Tooltip title={speakingMessageId === msg.id ? "Stop Reading" : "Read Aloud"}>
                                                <IconButton size="small" onClick={() => handleSpeak(msg.content, msg.id)} sx={{
                                                    color: speakingMessageId === msg.id ? '#EF4444' : '#94A3B8', p: 0.5,
                                                    bgcolor: speakingMessageId === msg.id ? '#FEF2F2' : 'transparent',
                                                    '&:hover': { color: '#6366F1', bgcolor: '#EEF2FF' }, transition: 'all 0.2s'
                                                }}>
                                                    {speakingMessageId === msg.id ? <StopCircleIcon size={16} /> : <VolumeHighIcon size={16} />}
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Fade>
                ))}

                {/* SKELETON */}
                {loading && (
                    <Fade in={true}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%', mt: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', maxWidth: '80%' }}>
                                <Avatar sx={{
                                    width: 38, height: 38, bgcolor: 'white', border: '1px solid #E2E8F0',
                                    color: '#6366F1', mt: 0.5
                                }}>
                                    <BotIcon size={20} />
                                </Avatar>
                                <Paper elevation={0} sx={{
                                    p: 3, borderRadius: 4, borderTopLeftRadius: 4, bgcolor: 'white', border: '1px solid #F1F5F9',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)', width: '100%', minWidth: 250
                                }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Skeleton variant="text" width="90%" height={24} sx={{ bgcolor: '#F1F5F9' }} />
                                        <Skeleton variant="text" width="80%" height={24} sx={{ bgcolor: '#F1F5F9' }} />
                                        <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: '#F1F5F9' }} />
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Fade>
                )}

                <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{
                p: 3, pb: 4,
                bgcolor: 'white', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center',
                gap: 2, position: 'sticky', bottom: 0, zIndex: 10, boxShadow: '0 -4px 20px rgba(0,0,0,0.02)'
            }}>
                <Paper elevation={0} sx={{
                    flex: 1, display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC', borderRadius: 4,
                    border: '1px solid #E2E8F0', p: 1.25, pl: 3, transition: 'all 0.2s',
                    '&:focus-within': { borderColor: '#818CF8', bgcolor: 'white', boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.08)' }
                }}>
                    <TextField fullWidth variant="standard" placeholder={isListening ? "Listening..." : "Ask anything about your journey..."}
                        value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        InputProps={{ disableUnderline: true, sx: { color: '#0F172A', fontSize: '1.05rem', fontWeight: 400 } }}
                        disabled={loading} autoComplete="off"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isListening && (
                            <Tooltip title="Cancel Recording">
                                <IconButton onClick={cancelRecording} sx={{ color: '#94A3B8', mr: 0.5, '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                                    <Cancel01Icon size={20} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title={micPermissionDenied ? "Microphone Access Denied" : (isListening ? "Listening... (Tap to toggle)" : "Tap to Speak")}>
                            <IconButton onClick={handleMicClick} disabled={loading} sx={{
                                color: isListening ? '#EF4444' : (micPermissionDenied ? '#EF4444' : '#64748B'), mr: 1,
                                bgcolor: isListening ? '#FEF2F2' : 'transparent', position: 'relative',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', transform: isListening ? 'scale(1.1)' : 'scale(1)',
                                '&:hover': { color: isListening ? '#DC2626' : '#4F46E5', bgcolor: isListening ? '#FEE2E2' : '#F1F5F9' }
                            }}>
                                {isListening ? (
                                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box sx={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid #FCA5A5', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                                        <Mic02Icon size={22} />
                                    </Box>
                                ) : (<Mic01Icon size={22} />)}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Paper>
                <IconButton onClick={() => handleSend()} disabled={loading || !input.trim()} sx={{
                    color: 'white', bgcolor: '#0F172A', width: 56, height: 56, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
                    '&:hover': { bgcolor: '#1E293B', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' },
                    '&.Mui-disabled': { bgcolor: '#F1F5F9', color: '#CBD5E1', boxShadow: 'none' },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <SentIcon size={24} />
                </IconButton>
                <style>
                    {`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                    @keyframes pulse-dot { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
                    @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
                    `}
                </style>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: 4,
                        p: 1,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #E2E8F0'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, color: '#0F172A', pb: 1 }}>
                    Clear Chat History?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: '#64748B' }}>
                        This action cannot be undone. All your messages and AI responses will be permanently removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{
                            color: '#64748B',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDeleteChat}
                        variant="contained"
                        color="error"
                        disableElevation
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#EF4444',
                            '&:hover': { bgcolor: '#DC2626' }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AICounselorPage;
