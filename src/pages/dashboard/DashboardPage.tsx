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
    Stepper,
    Step,
    StepLabel,
    IconButton,
    CircularProgress,
    Fade,
    Grow,
    LinearProgress
} from '@mui/material';
import {
    PencilEdit02Icon,
    CheckmarkCircle01Icon,
    Delete02Icon,
    Mortarboard01Icon,
    Globe02Icon,
    Calendar03Icon,
    Money03Icon,
    Award01Icon,
    BookOpen01Icon,
    Task01Icon
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
    const [dbTasks, setDbTasks] = useState<Task[]>([]);
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
                const [list, tasks] = await Promise.all([getShortlist(), getTasks()]);
                setShortlist(list);
                setDbTasks(tasks);
            } catch (e) { console.error(e); }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const unsubscribe = events.subscribe(() => {
            console.log("Dashboard refreshing due to AI Action...");
            fetchData();
        });
        return () => { unsubscribe(); };
    }, []);

    // --- Logic ---
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

    interface DashboardTask {
        id?: string;
        text: string;
        sub: string;
        checked: boolean;
        isDynamic?: boolean;
    }

    const getCombinedTasks = (p: any) => {
        const tasks: DashboardTask[] = [];
        dbTasks.forEach(t => {
            tasks.push({
                id: t.id,
                text: t.text,
                sub: 'AI Recommendation',
                checked: t.completed,
                isDynamic: true
            });
        });

        if (!p?.gpa || !p?.education_level) {
            tasks.push({ text: 'Complete Profile Details', sub: 'Add GPA and Education Level', checked: false });
        }
        if (p?.intended_degree === 'Masters' && p?.exam_gre_status !== 'taken') {
            tasks.push({ text: 'Take GRE Exam', sub: 'Required for many MS programs', checked: false });
        }
        return tasks;
    };

    const handleToggleTask = async (task: DashboardTask) => {
        if (task.isDynamic && task.id) {
            const newTasks = dbTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
            setDbTasks(newTasks);
            try {
                const { updateTaskStatus } = await import('../../lib/api');
                await updateTaskStatus(task.id, !task.checked);
            } catch (err) {
                console.error("Failed to update task", err);
                setDbTasks(dbTasks);
            }
        } else {
            navigate('/profile');
        }
    };

    const handleDeleteTask = async (task: DashboardTask) => {
        if (!task.id) return;
        const newTasks = dbTasks.filter(t => t.id !== task.id);
        setDbTasks(newTasks);
        try {
            const { deleteTask } = await import('../../lib/api');
            await deleteTask(task.id);
        } catch (err) {
            console.error("Failed to delete task", err);
            fetchData();
        }
    };

    if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress sx={{ color: '#1e293b' }} /></Box>;

    const currentStage = getCurrentStage(profile, shortlist);
    const strength = getProfileStrength(profile);
    const todoList = getCombinedTasks(profile);
    const progress = todoList.length > 0 ? (todoList.filter(t => t.checked).length / todoList.length) * 100 : 0;

    return (
        <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>

            {/* 1. HERO SECTION */}
            <Fade in={true} timeout={800}>
                <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Award01Icon size={20} color="#6366f1" />
                            <Typography variant="overline" fontWeight="700" color="#6366f1" sx={{ letterSpacing: '0.1em' }}>
                                STUDENT DASHBOARD
                            </Typography>
                        </Stack>
                        <Typography variant="h3" fontWeight="800" color="#0f172a" sx={{ letterSpacing: '-0.03em', mb: 1 }}>
                            Welcome back, <span style={{ color: '#6366f1' }}>{profile?.full_name?.split(' ')[0] || 'Scholar'}</span>
                        </Typography>
                        <Typography variant="body1" color="#64748b" sx={{ fontSize: '1.1rem', maxWidth: 600 }}>
                            You're making great progress. Here's an overview of your application journey.
                        </Typography>
                    </Box>

                    {/* Current Stage Pill */}
                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: 'white',
                        px: 2.5,
                        py: 1.5,
                        borderRadius: 50,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: '0 0 0 4px rgba(34, 197, 94, 0.2)' }} />
                        <Typography variant="subtitle2" fontWeight="700" color="#334155">
                            {STAGES[currentStage]}
                        </Typography>
                    </Box>
                </Box>
            </Fade>

            <Grid container spacing={4}>

                {/* 2. MAIN STATS GRID */}
                <Grid item xs={12} lg={8}>
                    <Fade in={true} timeout={1000}>
                        <Grid container spacing={2.5} sx={{ mb: 5 }}>
                            {[
                                { label: 'Intended Degree', value: profile?.intended_degree || 'Not Set', icon: <Mortarboard01Icon size={22} color="#4f46e5" />, bg: '#eef2ff' },
                                { label: 'Target GPA', value: profile?.gpa || 'TBD', icon: <BookOpen01Icon size={22} color="#0891b2" />, bg: '#ecfeff' },
                                { label: 'Major', value: profile?.degree_major || 'Undecided', icon: <Calendar03Icon size={22} color="#ec4899" />, bg: '#fdf2f8' },
                                { label: 'Budget Range', value: profile?.budget_range || 'TBD', icon: <Money03Icon size={22} color="#059669" />, bg: '#ecfdf5' },
                                { label: 'Target Region', value: profile?.preferred_countries?.[0] || 'Global', icon: <Globe02Icon size={22} color="#db2777" />, bg: '#fdf2f8' },
                            ].map((stat, i) => (
                                <Grid item xs={12} sm={i < 3 ? 4 : 6} key={i}>
                                    <Grow in={true} timeout={1000 + (i * 100)}>
                                        <Card sx={{
                                            borderRadius: 4,
                                            height: '100%',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                                                borderColor: '#e2e8f0'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Box sx={{
                                                    width: 44, height: 44, mb: 2, borderRadius: 3, bgcolor: stat.bg,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {stat.icon}
                                                </Box>
                                                <Typography variant="body2" color="#64748b" fontWeight="600" sx={{ mb: 0.5 }}>
                                                    {stat.label}
                                                </Typography>
                                                <Typography variant="h6" color="#0f172a" fontWeight="700" noWrap>
                                                    {stat.value}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grow>
                                </Grid>
                            ))}
                        </Grid>
                    </Fade>

                    {/* 3. ACTION PLAN (TASKS) */}
                    <Fade in={true} timeout={1200}>
                        <Card sx={{
                            borderRadius: 5,
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            overflow: 'visible'
                        }}>
                            <Box sx={{ p: 4, borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#fff7ed', color: '#ea580c' }}>
                                        <Task01Icon size={22} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight="800" color="#1e293b">To-Do Tasks</Typography>
                                        <Typography variant="body2" color="#64748b" fontWeight="500">
                                            {Math.round(progress)}% completed
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={100}
                                        size={50}
                                        thickness={4}
                                        sx={{ color: '#f1f5f9', position: 'absolute' }}
                                    />
                                    <CircularProgress
                                        variant="determinate"
                                        value={progress}
                                        size={50}
                                        thickness={4}
                                        sx={{ color: '#f97316', strokeLinecap: 'round' }}
                                    />
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="caption" fontWeight="800" color="#1e293b">
                                            {Math.round(progress)}%
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <List sx={{ p: 1 }}>
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
                                                        color: '#e2e8f0',
                                                        transition: 'all 0.2s',
                                                        '&:hover': { color: '#ef4444', bgcolor: '#fee2e2' }
                                                    }}
                                                >
                                                    <Delete02Icon size={18} />
                                                </IconButton>
                                            )
                                        }
                                        sx={{ mb: 1 }}
                                    >
                                        <ListItemButton
                                            onClick={() => handleToggleTask(task)}
                                            sx={{
                                                borderRadius: 3,
                                                py: 2,
                                                px: 3,
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: '#f8fafc', transform: 'translateX(4px)' }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 48 }}>
                                                {task.checked ? (
                                                    <Box sx={{
                                                        width: 24, height: 24, borderRadius: '50%',
                                                        bgcolor: '#6366f1', color: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <CheckmarkCircle01Icon size={16} />
                                                    </Box>
                                                ) : (
                                                    <Box sx={{
                                                        width: 24, height: 24, borderRadius: '50%',
                                                        border: '2px solid #cbd5e1',
                                                        bgcolor: 'transparent'
                                                    }} />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" fontWeight={600} sx={{
                                                        textDecoration: task.checked ? 'line-through' : 'none',
                                                        color: task.checked ? '#94a3b8' : '#334155',
                                                        transition: 'color 0.2s'
                                                    }}>
                                                        {task.text}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" color="#94a3b8" fontWeight="500">
                                                        {task.sub}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                                {todoList.length === 0 && (
                                    <Box sx={{ p: 6, textAlign: 'center' }}>
                                        <Typography color="#94a3b8" fontWeight="500">You're all caught up!</Typography>
                                    </Box>
                                )}
                            </List>
                        </Card>
                    </Fade>
                </Grid>

                {/* 4. RIGHT SIDEBAR (SUMMARY) */}
                <Grid item xs={12} lg={4}>
                    <Fade in={true} timeout={1400}>
                        <Stack spacing={4}>

                            {/* Readiness Card */}
                            <Card sx={{
                                borderRadius: 5,
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                bgcolor: 'white'
                            }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                        <Typography variant="h6" fontWeight="800" color="#1e293b">Readiness Score</Typography>
                                        <IconButton size="small" onClick={() => navigate('/profile')}>
                                            <PencilEdit02Icon size={18} color="#94a3b8" />
                                        </IconButton>
                                    </Box>

                                    <Stack spacing={3}>
                                        {[
                                            { label: 'Academic Profile', val: strength.academic },
                                            { label: 'Test Prep', val: strength.exams },
                                            { label: 'Documents', val: strength.sop },
                                        ].map((s, i) => (
                                            <Box key={i}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" fontWeight="600" color="#64748b">{s.label}</Typography>
                                                    <Typography variant="caption" fontWeight="700"
                                                        sx={{
                                                            px: 1, py: 0.5, borderRadius: 1,
                                                            bgcolor: s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? '#dcfce7' : '#fef3c7',
                                                            color: s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? '#166534' : '#b45309'
                                                        }}>
                                                        {s.val.toUpperCase()}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={
                                                        s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? 100 :
                                                            (s.val === 'Average' || s.val === 'In Progress' ? 50 : 15)
                                                    }
                                                    sx={{
                                                        height: 6,
                                                        borderRadius: 3,
                                                        bgcolor: '#f1f5f9',
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 3,
                                                            bgcolor: s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? '#22c55e' : '#f59e0b'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Journey Stepper */}
                            <Box sx={{ px: 2 }}>
                                <Typography variant="h6" fontWeight="800" color="#1e293b" sx={{ mb: 3 }}>
                                    Your Journey
                                </Typography>
                                <Stepper activeStep={currentStage} orientation="vertical"
                                    sx={{
                                        '& .MuiStepConnector-root': { ml: 1.5 },
                                        '& .MuiStepConnector-line': {
                                            borderColor: '#cbd5e1',
                                            borderLeftWidth: 2,
                                            minHeight: 32
                                        },
                                        '& .MuiStepContent-root': {
                                            ml: 1.5,
                                            pl: 3,
                                            borderLeft: '2px solid #cbd5e1'
                                        },
                                        '& .MuiStepLabel-iconContainer': { paddingRight: 2 },
                                    }}
                                >
                                    {STAGES.map((label, index) => (
                                        <Step key={label} expanded>
                                            <StepLabel StepIconComponent={() => (
                                                <Box sx={{
                                                    width: 24, height: 24, borderRadius: '50%',
                                                    bgcolor: index <= currentStage ? '#6366f1' : 'white',
                                                    border: '2px solid',
                                                    borderColor: index <= currentStage ? '#6366f1' : '#cbd5e1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    zIndex: 1,
                                                    boxShadow: index === currentStage ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none'
                                                }}>
                                                    {index < currentStage && <CheckmarkCircle01Icon size={14} color="white" />}
                                                    {index === currentStage && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />}
                                                </Box>
                                            )}>
                                                <Typography variant="body1" fontWeight={index === currentStage ? 700 : 600}
                                                    color={index <= currentStage ? '#1e293b' : '#94a3b8'}>
                                                    {label}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>

                        </Stack>
                    </Fade>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
