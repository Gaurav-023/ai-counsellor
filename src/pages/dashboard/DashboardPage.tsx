
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
    LinearProgress,
    Chip
} from '@mui/material';
import {
    PencilEdit02Icon,
    CheckmarkCircle01Icon,
    Delete02Icon,
    Mortarboard01Icon,
    Globe02Icon,
    Calendar03Icon,
    Money03Icon,
    BookOpen01Icon,
    StarIcon
} from 'hugeicons-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getShortlist, getTasks, type Task } from '../../lib/api';
import type { ShortlistItem } from '../../lib/types';
import { events } from '../../lib/events';

const STAGES = [
    'Profile Setup',
    'University Search',
    'Shortlist & Strategy',
    'Track Applications'
];

const STAGE_ROUTES = ['/profile', '/universities', '/shortlist', '/application'];

const DashboardPage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
    const [dbTasks, setDbTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // 1. Fetch Basic Identity (Name, etc.)
            const { data: basicData } = await supabase
                .from('profiles')
                .select('username, full_name, avatar_url')
                .eq('id', user.id)
                .single();

            // 2. Fetch Student Details
            const { data: studentData } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile({ ...basicData, ...studentData, email: user.email });

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
            setTimeout(() => fetchData(), 500); // Wait for DB commit
        });
        return () => { unsubscribe(); };
    }, []);

    // --- Logic ---
    const getCurrentStage = (p: any, list: ShortlistItem[]) => {
        const hasLocked = list.some(s => s.status === 'Locked');
        if (hasLocked) return 3;
        if (list.length > 0) return 2;
        if (p && (p.intended_degree || p.degree_major || p.gpa || p.education_level)) return 1;
        return 0;
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

    if (loading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', height: '100%' }}><CircularProgress sx={{ color: '#1e293b' }} /></Box>;

    const currentStage = getCurrentStage(profile, shortlist);
    const strength = getProfileStrength(profile);
    const todoList = getCombinedTasks(profile);
    const progress = todoList.length > 0 ? (todoList.filter(t => t.checked).length / todoList.length) * 100 : 0;

    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto' }}>

            {/* 1. HERO BENTO (Welcome Banner) */}
            <Fade in={true} timeout={600}>
                <Box sx={{
                    mb: 4,
                    p: { xs: 3, md: 5 },
                    borderRadius: 4,
                    background: 'linear-gradient(120deg, #1E3A8A 0%, #3B82F6 100%)', // Deep Blue Gradient
                    color: 'white',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 3,
                    boxShadow: '0 20px 40px -10px rgba(30, 58, 138, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative Elements */}
                    <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ position: 'absolute', bottom: -30, left: 100, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, opacity: 0.9 }}>
                            <Box sx={{ p: 0.5, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1 }}><StarIcon size={14} /></Box>
                            <Typography variant="overline" fontWeight="700" sx={{ letterSpacing: '0.1em' }}>
                                PREMIUM DASHBOARD
                            </Typography>
                        </Stack>
                        <Typography variant="h3" fontWeight="800" sx={{ letterSpacing: '-0.02em', mb: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                            Hello, {profile?.username || profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Scholar'}!
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 500, fontSize: '1.1rem' }}>
                            Your application journey is on track. Let's make today productive.
                        </Typography>
                    </Box>

                    <Box sx={{
                        position: 'relative', zIndex: 1,
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 3,
                        p: 2, px: 3,
                        border: '1px solid rgba(255,255,255,0.2)',
                        minWidth: 200
                    }}>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.8, fontWeight: 700, letterSpacing: '0.05em' }}>Current Focus</Typography>
                        <Typography variant="h6" fontWeight="700" sx={{ mt: 0.5 }}>{STAGES[currentStage]}</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={((currentStage + 1) / 4) * 100}
                            sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#4ADE80' } }}
                        />
                    </Box>
                </Box>
            </Fade>

            {/* 2. METRICS ROW (3 Top, 2 Bottom) */}
            <Fade in={true} timeout={800}>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {/* TOP ROW: 3 Cards */}
                    {[
                        { label: 'Degree', value: profile?.intended_degree || 'Not Set', icon: <Mortarboard01Icon size={24} color="#F43F5E" />, bg: '#FFF1F2', cols: 4 },
                        { label: 'Major', value: profile?.degree_major || 'Undecided', icon: <Calendar03Icon size={24} color="#8B5CF6" />, bg: '#F5F3FF', cols: 4 },
                        { label: 'Target GPA', value: profile?.gpa || 'TBD', icon: <BookOpen01Icon size={24} color="#0EA5E9" />, bg: '#F0F9FF', cols: 4 },
                    ].map((stat, i) => (
                        <Grid item xs={12} md={stat.cols} key={i}>
                            <Card sx={{
                                height: '100%', borderRadius: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                border: '1px solid #F1F5F9', transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }
                            }}>
                                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</Box>
                                    <Box>
                                        <Typography variant="caption" color="#64748B" fontWeight="600" display="block">{stat.label}</Typography>
                                        <Typography variant="subtitle1" color="#0F172A" fontWeight="800" noWrap sx={{ lineHeight: 1.2 }}>{stat.value}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {/* BOTTOM ROW: 2 Cards (Country Expanded) */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{
                            height: '100%', borderRadius: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                            border: '1px solid #F1F5F9', transition: 'transform 0.2s', bgcolor: '#FFFBEB',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }
                        }}>
                            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 3, height: '100%' }}>
                                <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Globe02Icon size={24} color="#F59E0B" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="#B45309" fontWeight="700" display="block">TARGET COUNTRY</Typography>
                                    <Typography variant="h5" color="#78350F" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                                        {profile?.preferred_countries?.[0] || 'Global Exploration'}
                                    </Typography>
                                    {profile?.preferred_countries?.length > 1 && (
                                        <Typography variant="caption" color="#B45309">
                                            + {profile.preferred_countries.length - 1} more preferred
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{
                            height: '100%', borderRadius: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                            border: '1px solid #F1F5F9', transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }
                        }}>
                            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Money03Icon size={24} color="#10B981" />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="#64748B" fontWeight="600" display="block">Est. Budget</Typography>
                                    <Typography variant="subtitle1" color="#0F172A" fontWeight="800" noWrap sx={{ lineHeight: 1.2 }}>{profile?.budget_range || 'TBD'}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Fade>

            {/* 3. MAIN CONTENT SPLIT (2:1 Ratio) */}
            <Grid container spacing={4}>
                {/* LEFT COLUMN: COMMAND CENTER */}
                <Grid item xs={12} lg={8}>
                    <Fade in={true} timeout={1000}>
                        <Card sx={{
                            borderRadius: 5,
                            border: '1px solid #F1F5F9',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                            overflow: 'hidden', height: '100%'
                        }}>
                            {/* Header */}
                            <Box sx={{ p: 3, borderBottom: '1px solid #F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" fontWeight="800" color="#1E293B">To-Do Tasks</Typography>
                                    <Typography variant="body2" color="#64748B">Priority actions for your success</Typography>
                                </Box>
                                <Chip
                                    label={`${Math.round(progress)}% Complete`}
                                    sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, borderRadius: 2 }}
                                />
                            </Box>

                            {/* Task List */}
                            <List sx={{ p: 2 }}>
                                {todoList.map((task, idx) => (
                                    <ListItem
                                        key={idx}
                                        disablePadding
                                        secondaryAction={
                                            task.isDynamic && (
                                                <IconButton
                                                    edge="end"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                                    sx={{ color: '#E2E8F0', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
                                                >
                                                    <Delete02Icon size={18} />
                                                </IconButton>
                                            )
                                        }
                                        sx={{ mb: 1.5 }}
                                    >
                                        <ListItemButton
                                            onClick={() => handleToggleTask(task)}
                                            sx={{
                                                borderRadius: 3,
                                                py: 2.5, px: 3,
                                                border: '1px solid',
                                                borderColor: task.checked ? 'transparent' : '#F1F5F9',
                                                bgcolor: task.checked ? '#F8FAFC' : 'white',
                                                boxShadow: task.checked ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: '#3B82F6',
                                                    bgcolor: task.checked ? '#F8FAFC' : '#F8FAFC',
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 56 }}>
                                                {task.checked ? (
                                                    <Box sx={{
                                                        width: 28, height: 28, borderRadius: '50%',
                                                        bgcolor: '#2563EB', color: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <CheckmarkCircle01Icon size={18} />
                                                    </Box>
                                                ) : (
                                                    <Box sx={{
                                                        width: 28, height: 28, borderRadius: '50%',
                                                        border: '2px solid #CBD5E1',
                                                        bgcolor: 'transparent'
                                                    }} />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="h6" fontWeight={600} sx={{
                                                        fontSize: '1rem',
                                                        textDecoration: task.checked ? 'line-through' : 'none',
                                                        color: task.checked ? '#94A3B8' : '#1E293B',
                                                    }}>
                                                        {task.text}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
                                                        {task.sub}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                                {todoList.length === 0 && (
                                    <Box sx={{ p: 8, textAlign: 'center' }}>
                                        <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', bgcolor: '#ECFDF5', mb: 2 }}>
                                            <CheckmarkCircle01Icon size={32} color="#10B981" />
                                        </Box>
                                        <Typography variant="h6" color="#1E293B" fontWeight="700">All caught up!</Typography>
                                        <Typography color="#64748B">Great job clearing your tasks.</Typography>
                                    </Box>
                                )}
                            </List>
                        </Card>
                    </Fade>
                </Grid>

                {/* RIGHT COLUMN: JOURNEY & READINESS */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={4}>
                        {/* Readiness Card - Compact */}
                        <Fade in={true} timeout={1200}>
                            <Card sx={{ borderRadius: 5, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', bgcolor: 'white' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6" fontWeight="800" color="#1E293B">Readiness</Typography>
                                        <IconButton size="small" onClick={() => navigate('/profile')}>
                                            <PencilEdit02Icon size={18} color="#94A3B8" />
                                        </IconButton>
                                    </Box>

                                    <Stack spacing={2.5}>
                                        {[
                                            { label: 'Academic', val: strength.academic },
                                            { label: 'Exams', val: strength.exams },
                                            { label: 'Documents', val: strength.sop },
                                        ].map((s, i) => (
                                            <Box key={i}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" fontWeight="600" color="#64748B">{s.label}</Typography>
                                                    <Typography variant="caption" fontWeight="700" color={s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? '#166534' : '#B45309'}>
                                                        {s.val}
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? 100 : 50}
                                                    sx={{
                                                        height: 8, borderRadius: 4, bgcolor: '#F1F5F9',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: s.val === 'Strong' || s.val === 'Completed' || s.val === 'Ready' ? '#22C55E' : '#EAB308'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Fade>

                        {/* Journey Timeline */}
                        <Fade in={true} timeout={1400}>
                            <Box sx={{ px: 1 }}>
                                <Typography variant="h6" fontWeight="800" color="#1E293B" sx={{ mb: 3 }}>Your Path</Typography>
                                <Stepper activeStep={currentStage} orientation="vertical"
                                    sx={{
                                        '& .MuiStepConnector-line': { borderColor: '#E2E8F0', borderLeftWidth: 2, minHeight: 40 },
                                        '& .MuiStepContent-root': { borderLeft: '2px solid #E2E8F0', paddingLeft: 3 }
                                    }}
                                >
                                    {STAGES.map((label, index) => (
                                        <Step key={label} expanded onClick={() => navigate(STAGE_ROUTES[index])} sx={{ cursor: 'pointer' }}>
                                            <StepLabel StepIconComponent={() => (
                                                <Box sx={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    bgcolor: index <= currentStage ? '#2563EB' : 'white',
                                                    border: '2px solid',
                                                    borderColor: index <= currentStage ? '#2563EB' : '#CBD5E1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: index <= currentStage ? 'white' : '#CBD5E1',
                                                    boxShadow: index === currentStage ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none'
                                                }}>
                                                    {index < currentStage ? <CheckmarkCircle01Icon size={18} /> : <Typography variant="caption" fontWeight="700">{index + 1}</Typography>}
                                                </Box>
                                            )}>
                                                <Typography variant="body1" fontWeight={index === currentStage ? 700 : 600} color={index <= currentStage ? '#1E293B' : '#94A3B8'}>
                                                    {label}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                        </Fade>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
