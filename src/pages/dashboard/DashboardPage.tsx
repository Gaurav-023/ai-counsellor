import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
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
    Checkbox,
    IconButton
} from '@mui/material';
import {
    Clock01Icon,
    PencilEdit02Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon
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
        if (p?.exam_ielts_status !== 'taken') {
            tasks.push({ text: 'Take English Proficiency Test', sub: 'IELTS or TOEFL required', checked: false });
        } else {
            // If taken, maybe don't show or show as checked? Logic kept simple.
        }
        if (p?.intended_degree === 'Masters' && p?.exam_gre_status !== 'taken') {
            tasks.push({ text: 'Take GRE Exam', sub: 'Required for many MS programs', checked: false });
        }
        if (p?.sop_status !== 'Ready') {
            tasks.push({ text: 'Draft Statement of Purpose', sub: 'Write your SOP', checked: false });
        }

        return tasks;
    };


    if (loading) {
        return <Box sx={{ p: 4 }}>Loading control center...</Box>;
    }

    const currentStage = getCurrentStage(profile, shortlist);
    const strength = getProfileStrength(profile);
    const todoList = getCombinedTasks(profile);

    const getStrengthChipColor = (val: string) => {
        if (val === 'Strong' || val === 'Completed' || val === 'Ready') return 'success';
        if (val === 'Average' || val === 'In Progress' || val === 'Draft') return 'warning';
        return 'default';
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="#1e293b">Control Center</Typography>
                    <Typography variant="body1" color="#64748b">
                        {STAGES[currentStage]}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>

                {/* C. Current Stage Indicator */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <CardContent sx={{ py: 4 }}>
                            <Stepper activeStep={currentStage} alternativeLabel>
                                {STAGES.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </CardContent>
                    </Card>
                </Grid>

                {/* A. Profile Summary */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', position: 'relative' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h6" fontWeight="bold" color="#1e293b" gutterBottom>Profile Summary</Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => navigate('/onboarding')}
                                    sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
                                >
                                    <PencilEdit02Icon size={16} />
                                </IconButton>
                            </Box>

                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={6}>
                                    <Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="600">EDUCATION</Typography>
                                        <Typography variant="body2" fontWeight="500">
                                            {profile?.education_level || 'N/A'}
                                            {profile?.degree_major ? ` • ${profile.degree_major}` : ''}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="600">GPA / GRADE</Typography>
                                        <Typography variant="body2" fontWeight="500">{profile?.gpa || 'Not specified'}</Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={6}>
                                    <Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="600">TARGET INTAKE</Typography>
                                        <Typography variant="body2" fontWeight="500">{profile?.intended_degree || 'Not specified'}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="600">BUDGET</Typography>
                                        <Typography variant="body2" fontWeight="500">{profile?.budget_range || 'Not specified'}</Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="600">EXAMS</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                            <Chip
                                                label={`IELTS: ${profile?.exam_ielts_score || profile?.exam_ielts_status || 'N/A'}`}
                                                size="small"
                                                variant="outlined"
                                                color={profile?.exam_ielts_status === 'taken' ? 'success' : 'default'}
                                            />
                                            <Chip
                                                label={`GRE: ${profile?.exam_gre_score || profile?.exam_gre_status || 'N/A'}`}
                                                size="small"
                                                variant="outlined"
                                                color={profile?.exam_gre_status === 'taken' ? 'success' : 'default'}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box>
                                        <Typography variant="caption" color="#64748b" fontWeight="600">COUNTRIES</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                            {profile?.preferred_countries && profile.preferred_countries.length > 0 ? (
                                                profile.preferred_countries.map((c: string) => (
                                                    <Chip key={c} label={c} size="small" sx={{ bgcolor: '#f1f5f9', borderRadius: 1 }} />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">None selected</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* B. Profile Strength */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" color="#1e293b" gutterBottom>Profile Strength</Typography>

                            <Stack spacing={3} sx={{ mt: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="500">Academics</Typography>
                                    <Chip
                                        label={strength.academic}
                                        color={getStrengthChipColor(strength.academic)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="500">Exams</Typography>
                                    <Chip
                                        label={strength.exams}
                                        color={getStrengthChipColor(strength.exams)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" fontWeight="500">SOP</Typography>
                                    <Chip
                                        label={strength.sop}
                                        color={getStrengthChipColor(strength.sop)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            </Stack>

                            {/* AI Insight Box */}
                            <Box sx={{ mt: 4, bgcolor: '#f0f9ff', p: 2, borderRadius: 2, border: '1px solid #e0f2fe' }}>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    <AlertCircleIcon size={18} color="#0284c7" />
                                    <Typography variant="subtitle2" fontWeight="bold" color="#0284c7">AI Insight</Typography>
                                </Box>
                                <Typography variant="body2" color="#334155">
                                    {strength.academic === 'Strong'
                                        ? "Your academic profile is solid. Focus on standardizing tests to target Tier 1 universities."
                                        : "Improve your profile strength by detailing your projects and work experience in the SOP."}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* D. AI To-Do List */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold" color="#1e293b">Recommended Actions</Typography>
                                <Chip
                                    icon={<Clock01Icon size={14} />}
                                    label={`${todoList.filter(t => !t.checked).length} Pending`}
                                    size="small"
                                    color="primary"
                                    sx={{ bgcolor: '#eff6ff', color: '#1d4ed8' }}
                                />
                            </Box>
                            <List>
                                {todoList.map((task, idx) => (
                                    <ListItem
                                        key={idx}
                                        disablePadding
                                        sx={{
                                            borderBottom: idx !== todoList.length - 1 ? '1px solid #f1f5f9' : 'none',
                                            py: 1.5
                                        }}
                                    >
                                        <ListItemButton disableRipple sx={{ cursor: 'default', '&:hover': { bgcolor: 'transparent' } }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                {task.checked ? (
                                                    <CheckmarkCircle01Icon size={24} color="#10b981" />
                                                ) : (
                                                    <Checkbox edge="start" checked={false} tabIndex={-1} disableRipple />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            textDecoration: task.checked ? 'line-through' : 'none',
                                                            color: task.checked ? '#94a3b8' : '#1e293b',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {task.text}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="body2" color="#64748b">
                                                        {task.sub}
                                                    </Typography>
                                                }
                                            />
                                            {/* Only show Start button for standard non-dynamic tasks for now */}
                                            {!task.checked && !task.isDynamic && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => navigate('/onboarding')}
                                                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                                >
                                                    Start
                                                </Button>
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </Box>
    );
};

export default DashboardPage;
