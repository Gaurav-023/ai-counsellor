import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Chip,
    Stepper,
    Step,
    StepLabel,
    IconButton,
    CircularProgress,
    Fade,
    Grow
} from '@mui/material';
import {
    PencilEdit02Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    Delete02Icon,
    Mortarboard01Icon,
    Globe02Icon,
    Calendar03Icon,
    Money03Icon
} from 'hugeicons-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getShortlist, getTasks, type Task } from '../../lib/api';
import type { ShortlistItem } from '../../lib/types';
import { events } from '../../lib/events';

const STAGES = [
    'Building Profile',
    'Discovering Universities',
    'Finalizing Universities',
    'Preparing Applications'
];

const DashboardPage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
    const [dbTasks, setDbTasks] = useState<Task[]>([]); // Dynamic tasks from DB
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(data);

            try {
                // Fetch Shortlist & Tasks parallel
                const [list, tasks] = await Promise.all([getShortlist(), getTasks()]);
                setShortlist(list);
                setDbTasks(tasks);
            } catch (e) { console.error(e); }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // Subscribe to global refresh events (triggered by AI Chat)
        // Fix: Ensure cleanup returns void, not boolean
        const unsubscribe = events.subscribe(() => {
            console.log("Dashboard refreshing due to AI Action...");
            fetchData();
        });
        return () => { unsubscribe(); };
    }, []);

    // --- Logic Engines ---
    // (Existing logic kept for Stage & Strength)
    const getCurrentStage = (p: any, list: ShortlistItem[]) => {
        if (!p) return 0;
        if (!p.gpa || !p.intended_degree || !p.budget_range) return 0;
        const hasLocked = list.some(s => s.status === 'Locked');
        const hasShortlisted = list.length > 0;
        if (hasLocked) return 3;
        if (hasShortlisted) return 2;
        if (p.exam_ielts_status !== 'taken' && p.exam_gre_status !== 'taken') return 1;
        return 1;
    };

    const getProfileStrength = (p: any) => {
        if (!p) return { academic: 'Weak', exams: 'Not Started', sop: 'Not Started' };
        let academic = 'Average';
        const gpa = parseFloat(p.gpa);
        if (gpa >= 3.5) academic = 'Strong';
        else if (gpa < 2.5) academic = 'Weak';
        else if (!p.gpa) academic = 'Weak';
        let exams = 'Not Started';
        if (p.exam_ielts_status === 'taken' || p.exam_gre_status === 'taken') {
            exams = 'Completed';
            if ((p.exam_ielts_status === 'taken' && p.exam_ielts_status) && (p.exam_gre_status === 'taken')) {
                exams = 'Completed';
            } else {
                exams = 'In Progress';
            }
        } else if (p.exam_ielts_status === 'planned' || p.exam_gre_status === 'planned') {
            exams = 'In Progress';
        }
        let sop = p.sop_status === 'Ready' ? 'Ready' : (p.sop_status === 'Draft' ? 'Draft' : 'Not Started');
        return { academic, exams, sop };
    };

    // 3. Logic: Combine Static Recommendations + Dynamic AI Tasks
    interface DashboardTask {
        id?: string;
        text: string;
        sub: string;
        checked: boolean;
        isDynamic?: boolean;
    }

    const getCombinedTasks = (p: any) => {
        const tasks: DashboardTask[] = [];

        // Dynamic DB Tasks first (AI Generated)
        dbTasks.forEach(t => {
            tasks.push({
                id: t.id,
                text: t.text,
                sub: 'Added by AI Counsellor',
                checked: t.completed,
                isDynamic: true
            });
        });

        // Static Logic Tasks (Recommendations)
        if (!p?.gpa || !p?.education_level) {
            tasks.push({ text: 'Complete Profile Details', sub: 'Add GPA and Education Level', checked: false });
        }
        // Removed English Test as per user request
        // if (p?.exam_ielts_status !== 'taken') {
        //     tasks.push({ text: 'Take English Proficiency Test', sub: 'IELTS or TOEFL required', checked: false });
        // }
        if (p?.intended_degree === 'Masters' && p?.exam_gre_status !== 'taken') {
            tasks.push({ text: 'Take GRE Exam', sub: 'Required for many MS programs', checked: false });
        }
        // Removed SOP as per user request
        // if (p?.sop_status !== 'Ready') {
        //     tasks.push({ text: 'Draft Statement of Purpose', sub: 'Write your SOP', checked: false });
        // }

        return tasks;
    };

    const handleToggleTask = async (task: DashboardTask) => {
        if (task.isDynamic && task.id) {
            // Optimistic update
            const newTasks = dbTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
            setDbTasks(newTasks);
            try {
                // Import API function locally to avoid circular dependencies if any, or just used imported one
                const { updateTaskStatus } = await import('../../lib/api');
                await updateTaskStatus(task.id, !task.checked);
            } catch (err) {
                console.error("Failed to update task", err);
                // Revert on error
                setDbTasks(dbTasks);
            }
        } else {
            // Static task - redirect to profile to fix
            navigate('/profile');
        }
    };


    if (loading) {
        return <Box sx={{ p: 4 }}>Loading control center...</Box>;
    }

    const currentStage = getCurrentStage(profile, shortlist);
    const strength = getProfileStrength(profile);
    const todoList = getCombinedTasks(profile);

    // Removed unused getStrengthChipColor helper

    const handleDeleteTask = async (task: DashboardTask) => {
        if (!task.id) return;
        // Optimistic update
        const newTasks = dbTasks.filter(t => t.id !== task.id);
        setDbTasks(newTasks);
        try {
            // Import API function locally
            const { deleteTask } = await import('../../lib/api');
            await deleteTask(task.id);
        } catch (err) {
            console.error("Failed to delete task", err);
            // Revert (simplified re-fetch for now or state rollback)
            fetchData();
        }
    };

    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto', px: 2 }}>
            {/* Header Section */}
            <Fade in={true} timeout={800}>
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h3" fontWeight="800" color="#1e293b" sx={{ letterSpacing: '-0.03em', mb: 1 }}>
                            Hello, {profile?.full_name?.split(' ')[0] || 'Student'}
                        </Typography>
                        <Typography variant="body1" color="#64748b" sx={{ fontSize: '1.1rem', maxWidth: 500 }}>
                            Your application journey is on track. Here's what needs your attention today.
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, bgcolor: 'white', px: 2, py: 1, borderRadius: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                        <Typography variant="caption" fontWeight="700" color="#94a3b8" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Current Phase
                        </Typography>
                        <Chip
                            label={STAGES[currentStage]}
                            sx={{
                                bgcolor: 'rgba(59, 130, 246, 0.1)',
                                color: '#2563eb',
                                fontWeight: 700,
                                borderRadius: 2,
                                px: 0.5,
                                height: 32,
                                fontSize: '0.85rem'
                            }}
                        />
                    </Box>
                </Box>
            </Fade>

            <Grid container spacing={4}>

                {/* LEFT COLUMN: Main Actions & Stats */}
                <Grid item xs={12} lg={8}>

                    {/* Profile Snapshot Grid */}
                    <Fade in={true} timeout={1000}>
                        <Grid container spacing={2} sx={{ mb: 5 }}>
                            {[
                                { label: 'Degree', value: profile?.intended_degree || 'TBD', icon: <Mortarboard01Icon size={20} color="#6366f1" />, bg: '#eef2ff' },
                                { label: 'GPA', value: profile?.gpa || '-', icon: <AlertCircleIcon size={20} color="#f59e0b" />, bg: '#fffbeb' },
                                { label: 'Budget', value: profile?.budget_range || '-', icon: <Money03Icon size={20} color="#10b981" />, bg: '#ecfdf5' },
                                { label: 'Major', value: profile?.degree_major || '-', icon: <Calendar03Icon size={20} color="#ec4899" />, bg: '#fdf2f8' },
                                { label: 'Target', value: profile?.preferred_countries?.[0] || 'Global', icon: <Globe02Icon size={20} color="#0ea5e9" />, bg: '#f0f9ff' },
                            ].map((stat, i) => (
                                <Grid item xs={6} sm={4} md={2.4} key={i}>
                                    <Grow in={true} timeout={1000 + (i * 100)}>
                                        <Card sx={{
                                            borderRadius: 5,
                                            bgcolor: 'white',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', // Softer shadow
                                            border: '1px solid transparent',
                                            height: '100%',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0, 0, 0, 0.06)' }
                                        }}>
                                            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                                <Box sx={{
                                                    width: 40, height: 40, mb: 2, borderRadius: 3, bgcolor: stat.bg,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {stat.icon}
                                                </Box>
                                                <Typography variant="caption" fontWeight="700" color="#94a3b8" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                                                    {stat.label}
                                                </Typography>
                                                <Typography variant="body1" fontWeight="700" color="#1e293b" noWrap title={typeof stat.value === 'string' ? stat.value : ''}>
                                                    {stat.value}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grow>
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>

                    {/* Action Plan (Redesigned) */}
                    <Fade in={true} timeout={1400}>
                        <Card sx={{
                            borderRadius: 6, // Increased radius
                            border: 'none',
                            bgcolor: 'white',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)', // Softer shadow
                            overflow: 'visible'
                        }}>
                            <CardContent sx={{ p: 0 }}>
                                <Box sx={{ p: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f8fafc' }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight="800" color="#1e293b" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>Action Plan</Typography>
                                        <Typography variant="body1" color="#64748b">
                                            You have completed {todoList.filter(t => t.checked).length} out of {todoList.length} recommended tasks.
                                        </Typography>
                                    </Box>
                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={100}
                                            size={68}
                                            thickness={3}
                                            sx={{ color: '#f1f5f9', position: 'absolute' }}
                                        />
                                        <CircularProgress
                                            variant="determinate"
                                            value={todoList.length > 0 ? (todoList.filter(t => t.checked).length / todoList.length) * 100 : 0}
                                            size={68}
                                            thickness={3}
                                            sx={{ color: '#f97316', strokeLinecap: 'round' }}
                                        />
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography variant="body2" fontWeight="800" color="#1e293b">
                                                {Math.round(todoList.length > 0 ? (todoList.filter(t => t.checked).length / todoList.length) * 100 : 0)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <List sx={{ px: 0, py: 1 }}>
                                    {todoList.map((task, idx) => (
                                        <ListItem
                                            key={idx}
                                            disablePadding
                                            secondaryAction={
                                                task.isDynamic && (
                                                    <IconButton
                                                        edge="end"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                                        sx={{
                                                            opacity: 1, // Always visible
                                                            transition: 'all 0.2s',
                                                            color: '#cbd5e1', // Neutral default
                                                            '&:hover': { color: '#ef4444', bgcolor: '#fee2e2', transform: 'scale(1.1)' }
                                                        }}
                                                    >
                                                        <Delete02Icon size={20} />
                                                    </IconButton>
                                                )
                                            }
                                            sx={{
                                                borderBottom: '1px solid #f8fafc',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: '#fafafa',
                                                }
                                            }}
                                        >
                                            <ListItemButton
                                                onClick={() => handleToggleTask(task)}
                                                disableRipple
                                                sx={{ py: 3, px: 5 }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 56 }}>
                                                    {task.checked ? (
                                                        <Box sx={{
                                                            width: 28, height: 28, borderRadius: '50%',
                                                            bgcolor: '#dcfce7', color: '#16a34a',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        }}>
                                                            <CheckmarkCircle01Icon size={18} />
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{
                                                            width: 28, height: 28, borderRadius: '50%',
                                                            border: '2px solid #e2e8f0',
                                                            transition: 'all 0.2s',
                                                            bgcolor: '#fff',
                                                            '&:hover': { borderColor: '#94a3b8' }
                                                        }} />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body1" fontWeight={600} sx={{
                                                            textDecoration: task.checked ? 'line-through' : 'none',
                                                            color: task.checked ? '#94a3b8' : '#334155',
                                                            fontSize: '1.05rem',
                                                            mb: 0.5
                                                        }}>
                                                            {task.text}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" color="#94a3b8" fontWeight="500">
                                                            {task.sub}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                                {todoList.length === 0 && (
                                    <Box sx={{ p: 8, textAlign: 'center' }}>
                                        <Typography color="#94a3b8" fontWeight="500" fontSize="1.1rem">All caught up. Good job!</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* RIGHT COLUMN: Profile Strength & Progress */}
                <Grid item xs={12} lg={4}>
                    <Fade in={true} timeout={1600}>
                        <Stack spacing={4}>

                            {/* Application Readiness (Light Theme) */}
                            <Card sx={{
                                borderRadius: 5,
                                border: 'none',
                                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
                                bgcolor: 'white',
                                color: '#0f172a'
                            }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
                                        <Typography variant="h6" fontWeight="800" letterSpacing="-0.01em">Readiness Score</Typography>
                                        <IconButton size="small" sx={{ bgcolor: '#f8fafc', '&:hover': { bgcolor: '#f1f5f9' } }} onClick={() => navigate('/profile')}>
                                            <PencilEdit02Icon size={18} color="#64748b" />
                                        </IconButton>
                                    </Box>

                                    <Stack spacing={3}>
                                        {[
                                            { label: 'Academics', val: strength.academic },
                                            { label: 'Test Scores', val: strength.exams },
                                            { label: 'SOP', val: strength.sop },
                                        ].map((s, i) => (
                                            <Box key={i}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                                    <Typography variant="body2" fontWeight="600" color="#64748b">{s.label}</Typography>
                                                    <Typography variant="body2" fontWeight="700"
                                                        color={s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? '#16a34a' : '#eab308'}>
                                                        {s.val}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ height: 8, bgcolor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                                                    <Box sx={{
                                                        height: '100%',
                                                        width: s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? '100%' : (s.val === 'Average' || s.val === 'In Progress' ? '50%' : '15%'),
                                                        bgcolor: s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? '#22c55e' : '#facc15',
                                                        borderRadius: 5,
                                                        transition: 'width 1s ease-in-out'
                                                    }} />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>

                                    <Box sx={{ mt: 4, p: 2.5, bgcolor: '#f0f9ff', borderRadius: 3, display: 'flex', gap: 2, alignItems: 'start' }}>
                                        <AlertCircleIcon size={22} color="#0ea5e9" style={{ marginTop: 2 }} />
                                        <Typography variant="body2" fontWeight="500" color="#0c4a6e" sx={{ lineHeight: 1.6 }}>
                                            {strength.academic === 'Strong'
                                                ? "Your academics are strong. Focus on maximizing your test scores to unlock top universities."
                                                : "Boost your admission chances by highlighting personal projects in your Statement of Purpose."}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Progress Stepper */}
                            <Card sx={{ borderRadius: 5, border: 'none', boxShadow: 'none', bgcolor: 'transparent' }}>
                                <CardContent sx={{ p: 0 }}>
                                    <Typography variant="h6" fontWeight="800" color="#1e293b" sx={{ mb: 3, px: 1 }}>Your Journey</Typography>
                                    <Stepper activeStep={currentStage} orientation="vertical" sx={{
                                        '& .MuiStepConnector-line': { borderColor: '#e2e8f0', minHeight: 32 },
                                        '& .MuiStepLabel-iconContainer': { paddingRight: 2 },
                                        '& .MuiStepLabel-label': { fontWeight: 600, color: '#94a3b8', fontSize: '0.95rem' },
                                        '& .MuiStepLabel-label.Mui-active': { color: '#0f172a', fontWeight: 700 },
                                        '& .MuiStepLabel-label.Mui-completed': { color: '#10b981' },
                                    }}>
                                        {STAGES.map((label) => (
                                            <Step key={label}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </CardContent>
                            </Card>

                        </Stack>
                    </Fade>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
