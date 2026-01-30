import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Fab,
    CircularProgress,
    Tooltip,
    Stack,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Fade,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Comment01Icon,
    SentIcon,
    Cancel01Icon,
    Delete02Icon,
    MoreVerticalCircle01Icon,
    BotIcon,
    UserIcon
} from 'hugeicons-react';
import ReactMarkdown from 'react-markdown';
import { getChatHistory, sendMessageToAI, clearChatHistory, addToShortlist, addTask, updateStudentProfile } from '../../lib/api';
import type { ChatMessage } from '../../lib/types';
import { events } from '../../lib/events';

export const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Notifications
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    // Initial Load
    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const loadHistory = async () => {
        try {
            const history = await getChatHistory();
            // Client-side sort to be absolutely sure of order
            history.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setMessages(history);
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    };

    const performAction = async (actionJson: string) => {
        try {
            const action = JSON.parse(actionJson);
            console.log("Executing Action:", action);

            if (action.type === 'shortlist') {
                if (!action.data.university_id) throw new Error("Missing University ID");
                await addToShortlist(action.data.university_id, action.data.category || 'Target');
                setNotification({ message: `University added to ${action.data.category || 'Target'} list!`, type: 'success' });
            }
            else if (action.type === 'add_task') {
                if (!action.data.text) throw new Error("Missing Task Text");
                await addTask(action.data.text);
                setNotification({ message: "New task added to your To-Do list!", type: 'success' });
            }
            else if (action.type === 'update_profile') {
                // Normalization Logic: Map common AI hallucinations to actual DB columns
                const updates: any = {};
                const rawData = action.data;

                // Helper to set valid keys
                const mapKey = (val: any, ...keys: string[]) => keys.forEach(k => updates[k] = val);

                if (rawData.gpa) updates.gpa = rawData.gpa;

                // Smart Value-Based Normalization
                const cleanStr = (s: string) => s?.toLowerCase().trim() || '';

                // Check for Education Level keywords
                const isEduLevel = (val: string) => {
                    const s = cleanStr(val);
                    return s.includes('high school') || s.includes('undergrad') || s.includes('postgrad') || s === 'ug' || s === 'pg' || s.includes('grade 12') || s.includes('grade 11');
                };

                // Check for Intended Degree keywords (Target)
                const isTargetDegree = (val: string) => {
                    const s = cleanStr(val);
                    return s.includes('bachelor') || s.includes('master') || s.includes('mba') || s.includes('phd') || s.includes('doctorate') || s.includes('ms') || s.includes('ma ') || s.includes('msc');
                };

                // Process ambiguous keys
                let proposedEduLevel = rawData.education_level || rawData.education;
                let proposedTargetDegree = rawData.intended_degree || rawData.degree; // 'degree' is often ambiguous

                // Heuristic Fixes
                if (proposedTargetDegree && isEduLevel(proposedTargetDegree)) {
                    // AI put "High School" in "degree" -> Move to education_level
                    if (!proposedEduLevel) proposedEduLevel = proposedTargetDegree;
                    proposedTargetDegree = null; // Clear from target
                }

                if (proposedEduLevel && isTargetDegree(proposedEduLevel)) {
                    // AI put "Masters" in "education" (rare but possible if asking about target) -> Move to intended_degree
                    if (!proposedTargetDegree) proposedTargetDegree = proposedEduLevel;
                    // Don't clear proposedEduLevel necessarily, could be "I have a Bachelors" (current), but usually AI means target.
                    // For safety, let's trust explicit keys slightly, but "Use Common Sense".
                }

                if (proposedEduLevel) {
                    // Normalize Dropdown Values
                    const s = cleanStr(proposedEduLevel);
                    if (s.includes('high school') || s.includes('school')) updates.education_level = 'High School';
                    else if (s.includes('undergrad') || s === 'ug') updates.education_level = 'Undergraduate';
                    else if (s.includes('postgrad') || s === 'pg') updates.education_level = 'Postgraduate';
                    else updates.education_level = 'Other';
                }

                if (proposedTargetDegree) {
                    // Normalize Dropdown Values
                    const s = cleanStr(proposedTargetDegree);
                    if (s.includes('bachelor') || s.includes('bs') || s.includes('ba ')) updates.intended_degree = "Bachelor's Degree";
                    else if (s.includes('master') || s.includes('ms') || s.includes('ma ') || s.includes('msc')) updates.intended_degree = "Master's Degree";
                    else if (s.includes('mba')) updates.intended_degree = "MBA";
                    else if (s.includes('phd') || s.includes('doctor')) updates.intended_degree = "PhD / Doctorate";
                    else if (s.includes('associate')) updates.intended_degree = "Associate Degree";
                    else updates.intended_degree = proposedTargetDegree; // Fallback
                }

                // Other Fields
                if (rawData.gpa) updates.gpa = rawData.gpa;

                if (rawData.degree_major) updates.degree_major = rawData.degree_major;
                else if (rawData.major) updates.degree_major = rawData.major;

                if (rawData.budget_range) updates.budget_range = rawData.budget_range;
                else if (rawData.budget) updates.budget_range = rawData.budget;

                // Countries
                let countrySource = rawData.preferred_countries || rawData.countries;
                if (countrySource) {
                    updates.preferred_countries = Array.isArray(countrySource) ? countrySource : [countrySource];
                }

                console.log("Normalized Updates:", updates);

                if (Object.keys(updates).length > 0) {
                    await updateStudentProfile(updates);
                    setNotification({ message: "Profile updated successfully!", type: 'success' });
                } else {
                    console.warn("No valid fields found to update in:", rawData);
                    setNotification({ message: "Could not understand profile updates.", type: 'error' });
                }
            }
            else if (action.type === 'set_filter') {
                // Handling Filter Action from AI
                const { setChatFilters } = await import('../../store/filterStore').then(m => m.useFilterStore.getState());

                const updates: { country?: string; budget?: string; intake?: string } = {};

                if (action.data.country) updates.country = action.data.country;
                if (action.data.budget) updates.budget = action.data.budget;
                if (action.data.intake) updates.intake = action.data.intake;

                if (Object.keys(updates).length > 0) {
                    console.log("AI Action: Setting Filters", updates);
                    setChatFilters(updates);
                    // Emit event to trigger re-fetch in useUniversities if needed
                    events.emit();
                    setNotification({ message: `Filters updated: ${Object.values(updates).join(', ')}`, type: 'success' });
                }
            }

            // Trigger global refresh so Dashboard updates immediately!
            events.emit();

        } catch (error) {
            console.error("Action Failed:", error);
            // Don't error toast for every little AI hiccup, keeps UI clean, but log it.
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue;
        setInputValue(""); // Clear input early
        setIsLoading(true);

        // --- Intent Detection for Filter Store ---
        try {
            const lowerText = userText.toLowerCase();
            const { setChatFilters } = await import('../../store/filterStore').then(m => m.useFilterStore.getState());

            // Detect Country
            const countryMatch = lowerText.match(/(?:in|location|for|from) (india|united states|usa|uk|united kingdom|canada|australia|germany|ireland|new zealand|france|netherlands|sweden)/i);
            let detectedCountry;
            if (countryMatch) {
                const raw = countryMatch[1].toLowerCase();
                if (raw === 'usa' || raw === 'united states') detectedCountry = 'United States';
                else if (raw === 'uk' || raw === 'united kingdom') detectedCountry = 'United Kingdom';
                else detectedCountry = raw.charAt(0).toUpperCase() + raw.slice(1); // Title case simple names
            }

            // Detect Budget
            // "under 20k", "less than 20000", "budget 20k"
            const budgetMatch = lowerText.match(/(?:budget|cost|fee).{0,10}(?:under|less than|<).{0,5}(20|40|60)k?/i);
            let detectedBudget;
            if (budgetMatch) {
                const limit = budgetMatch[1];
                if (limit === '20') detectedBudget = 'under_20k';
                else if (limit === '40') detectedBudget = '20k_40k'; // Rough approximation
            }

            if (detectedCountry || detectedBudget) {
                console.log("Chat Intent Detected:", { detectedCountry, detectedBudget });
                setChatFilters({
                    country: detectedCountry,
                    budget: detectedBudget
                });

                // Also trigger event to notify components if they aren't listening to store directly (though store should handle it)
                events.emit();
            }

        } catch (err) { console.error("Intent Detection Error", err); }
        // -----------------------------------------

        try {
            // Optimistically add user message
            const tempUserMsg: ChatMessage = {
                id: 'temp-user',
                user_id: 'me',
                role: 'user',
                content: userText,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempUserMsg]);

            const newMessages = await sendMessageToAI(userText);

            // Check for Actions in AI Response
            // Improved Pattern: <<<ACTION...>>> handling multiline content
            const aiMsg = newMessages.find(m => m.role === 'assistant');
            if (aiMsg) {
                // [\s\S]*? means match any char including newlines (non-greedy)
                const actionRegex = /<<<ACTION([\s\S]*?)>>>/g;
                let match;
                let foundAction = false;

                while ((match = actionRegex.exec(aiMsg.content)) !== null) {
                    foundAction = true;
                    const actionJson = match[1];
                    try {
                        await performAction(actionJson);
                    } catch (e) { console.error("JSON parse error from AI action", e); }
                }

                // FALLBACK: If AI outputted a JSON object in text but forgot the ACTION tag
                if (!foundAction) {
                    // Try to find a JSON object that looks like profile data
                    const jsonRegex = /({[\s\n]*"[a-zA-Z0-9_]+":[\s\S]*?})/g; // Relaxed JSON regex
                    let jsonMatch;
                    while ((jsonMatch = jsonRegex.exec(aiMsg.content)) !== null) {
                        try {
                            const possibleData = JSON.parse(jsonMatch[1]);
                            // Heuristic: Does it have typical profile keys?
                            if (possibleData.gpa || possibleData.intended_degree || possibleData.education_level || possibleData.preferred_countries || possibleData.major || possibleData.budget) {
                                console.log("Found implicit JSON action:", possibleData);
                                await performAction(JSON.stringify({ type: 'update_profile', data: possibleData }));
                                foundAction = true;
                            }
                        } catch (e) {
                            // Not valid JSON, ignore
                        }
                    }
                }

                // Hide action tag from UI so it looks clean
                aiMsg.content = aiMsg.content.replace(actionRegex, '').trim();
            }

            // Replace with real messages from DB
            // Replace with real messages from DB
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== 'temp-user');
                const combined = [...filtered, ...newMessages];
                return combined.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            });

        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = async () => {
        try {
            await clearChatHistory();
            setMessages([]);
            setAnchorEl(null);
        } catch (error) {
            console.error("Failed to clear chat:", error);
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <Tooltip title="Chat with AI Counsellor" placement="left">
                <Fab
                    color="primary"
                    aria-label="chat"
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        zIndex: 1300,
                        backgroundColor: '#000', // Black for contrast in white theme
                        color: '#fff',
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.2)',
                        '&:hover': {
                            backgroundColor: '#333',
                            transform: 'scale(1.05)',
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    {isOpen ? <Cancel01Icon size={24} /> : <Comment01Icon size={24} />}
                </Fab>
            </Tooltip>

            {/* Chat Window */}
            <Fade in={isOpen}>
                <Paper
                    elevation={12}
                    sx={{
                        position: 'fixed',
                        bottom: 100,
                        right: 32,
                        width: { xs: 'calc(100vw - 48px)', sm: 400 },
                        height: 600,
                        maxHeight: 'calc(100vh - 140px)',
                        zIndex: 1300,
                        backgroundColor: '#fff',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0px 8px 32px rgba(0,0,0,0.12)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{
                        p: 2.5,
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)'
                    }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '12px',
                                backgroundColor: '#000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff'
                            }}>
                                <BotIcon size={20} />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="700" sx={{ lineHeight: 1.2 }}>
                                    AI Counsellor
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    • Online & Ready
                                </Typography>
                            </Box>
                        </Stack>

                        <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 1 }}>
                            <MoreVerticalCircle01Icon size={20} color="#666" />
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 4,
                                sx: { borderRadius: '12px', minWidth: 150, mt: 1 }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={handleClearChat} sx={{ color: '#d32f2f' }}>
                                <ListItemIcon>
                                    <Delete02Icon size={18} color="#d32f2f" />
                                </ListItemIcon>
                                <ListItemText primary="Clear History" />
                            </MenuItem>
                        </Menu>
                    </Box>

                    {/* Messages Area */}
                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2.5,
                        backgroundColor: '#fff'
                    }}>
                        {messages.length === 0 && (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                opacity: 0.6
                            }}>
                                <BotIcon size={48} color="#ddd" />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                    Hello! I'm your specific AI guide.<br />Ask me anything about universities.
                                </Typography>
                            </Box>
                        )}

                        {messages.map((msg) => {
                            const isUser = msg.role === 'user';
                            return (
                                <Box
                                    key={msg.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                                        alignItems: 'flex-end',
                                        gap: 1
                                    }}
                                >
                                    {!isUser && (
                                        <Box sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            backgroundColor: '#f5f5f5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 0.5,
                                            flexShrink: 0
                                        }}>
                                            <BotIcon size={16} color="#666" />
                                        </Box>
                                    )}

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: isUser ? '12px 16px' : '16px 20px',
                                            maxWidth: '85%',
                                            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                            backgroundColor: isUser ? '#000' : '#f5f5f7',
                                            color: isUser ? '#fff' : '#1a1a1a',
                                            border: isUser ? 'none' : '1px solid #eee'
                                        }}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.6, m: 0, mb: 1, '&:last-child': { mb: 0 } }} {...props} />,
                                                a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" style={{ color: isUser ? '#fff' : '#2563EB', textDecoration: 'underline' }} {...props} />,
                                                strong: ({ node, ...props }) => <Box component="span" sx={{ fontWeight: 600, color: isUser ? 'inherit' : '#0F172A' }} {...props} />,
                                                ul: ({ node, ...props }) => <Box component="ul" sx={{ pl: 2.5, my: 1 }} {...props} />,
                                                ol: ({ node, ...props }) => <Box component="ol" sx={{ pl: 2.5, my: 1 }} {...props} />,
                                                li: ({ node, ...props }) => <Box component="li" sx={{ fontSize: '0.95rem', mb: 0.5, '&::marker': { color: isUser ? 'rgba(255,255,255,0.7)' : '#64748B' } }} {...props} />,
                                                h1: ({ node, ...props }) => <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 2, mb: 1, color: isUser ? 'inherit' : '#0F172A', fontSize: '1rem' }} {...props} />,
                                                h2: ({ node, ...props }) => <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1.5, mb: 1, color: isUser ? 'inherit' : '#0F172A', fontSize: '1rem' }} {...props} />,
                                                h3: ({ node, ...props }) => <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, mb: 0.5, color: isUser ? 'inherit' : '#0F172A', fontSize: '0.95rem' }} {...props} />,
                                                blockquote: ({ node, ...props }) => (
                                                    <Box component="blockquote" sx={{
                                                        borderLeft: `3px solid ${isUser ? 'rgba(255,255,255,0.3)' : '#CBD5E1'}`,
                                                        pl: 2, py: 0.5, my: 1.5, ml: 0,
                                                        color: isUser ? 'rgba(255,255,255,0.8)' : '#475569',
                                                        fontStyle: 'italic',
                                                        fontSize: '0.95rem'
                                                    }} {...props} />
                                                ),
                                                code: ({ node, inline, className, children, ...props }: any) => {
                                                    if (inline) {
                                                        return (
                                                            <Box component="code" sx={{
                                                                bgcolor: isUser ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                                                                color: isUser ? 'inherit' : '#0F172A',
                                                                px: 0.5, py: 0.2, borderRadius: 1,
                                                                fontFamily: 'monospace', fontSize: '0.9em', fontWeight: 600
                                                            }} {...props}>
                                                                {children}
                                                            </Box>
                                                        );
                                                    }
                                                    return (
                                                        <Box component="pre" sx={{
                                                            bgcolor: '#F8FAFC',
                                                            color: '#1E293B',
                                                            p: 2, borderRadius: 2,
                                                            overflowX: 'auto',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.9em',
                                                            my: 1.5,
                                                            border: '1px solid #E2E8F0',
                                                            '& code': { bgcolor: 'transparent', p: 0 }
                                                        }}>
                                                            <code {...props}>{children}</code>
                                                        </Box>
                                                    );
                                                }
                                            }}
                                        >
                                            {(() => {
                                                // CLEANING LOGIC: Runs on every render to ensure clean UI
                                                let text = msg.content;

                                                // 1. Hide <<<ACTION...>>> blocks completely
                                                text = text.replace(/<<<ACTION[\s\S]*?>>>/g, '');

                                                // 2. Parse Profile JSON into Clean Text
                                                text = text.replace(/({[\s\n]*"[a-zA-Z0-9_]+":[\s\S]*?})/g, (match) => {
                                                    try {
                                                        const data = JSON.parse(match);
                                                        // Basic validation to ensure it looks like our profile data
                                                        if (Object.keys(data).length < 2) return match;

                                                        let md = "\n\n---\n**📋 Updated Profile Summary**\n\n";
                                                        Object.entries(data).forEach(([key, val]) => {
                                                            if (!val || val === "N/A" || val === "NOT SET" || val === "Not Taken") return;

                                                            // Beautify Key
                                                            const label = key
                                                                .replace(/_/g, " ")
                                                                .replace(/\b\w/g, (c) => c.toUpperCase())
                                                                .replace("Gpa", "GPA")
                                                                .replace("Ielts", "IELTS")
                                                                .replace("Gre", "GRE");

                                                            // Beautify Value
                                                            const valueStr = Array.isArray(val) ? val.join(", ") : String(val);

                                                            md += `* **${label}:** ${valueStr}\n`;
                                                        });
                                                        return md + "\n---\n";
                                                    } catch (e) {
                                                        return match; // Fallback to raw if logic fails
                                                    }
                                                });

                                                return text.trim();
                                            })()}
                                        </ReactMarkdown>
                                    </Paper>

                                    {isUser && (
                                        <Box sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            backgroundColor: '#f0f0f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 0.5,
                                            flexShrink: 0
                                        }}>
                                            <UserIcon size={16} color="#666" />
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                        {isLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4 }}>
                                <CircularProgress size={16} sx={{ color: '#999' }} />
                                <Typography variant="caption" color="text.secondary">Thinking...</Typography>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input Area */}
                    <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your question..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        onClick={handleSend}
                                        disabled={!inputValue.trim() || isLoading}
                                        sx={{
                                            color: inputValue.trim() ? '#000' : '#ddd',
                                            transition: 'color 0.2s',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0,0,0,0.04)'
                                            }
                                        }}
                                    >
                                        <SentIcon size={22} />
                                    </IconButton>
                                ),
                                sx: {
                                    borderRadius: '16px',
                                    backgroundColor: '#f9fafb',
                                    '& fieldset': { borderColor: 'transparent' },
                                    '&:hover fieldset': { borderColor: '#eee' },
                                    '&.Mui-focused fieldset': { borderColor: '#000' }
                                }
                            }}
                        />
                    </Box>
                </Paper>
            </Fade>

            {/* Notification Toast */}
            <Snackbar
                open={!!notification}
                autoHideDuration={4000}
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setNotification(null)} severity={notification?.type || 'info'} sx={{ width: '100%' }}>
                    {notification?.message}
                </Alert>
            </Snackbar>
        </>
    );
};
