import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    LinearProgress,
    Stack,
    Tabs,
    Tab,
    Fade,
    Checkbox
} from '@mui/material';
import {
    Mortarboard01Icon,
    Delete02Icon
} from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';
import { getShortlist } from '../../lib/api';
import type { ShortlistItem } from '../../lib/types';

const ApplicationPage = () => {
    const navigate = useNavigate();
    const [lockedUniversities, setLockedUniversities] = useState<ShortlistItem[]>([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Finalize Statement of Purpose (SOP)', type: 'Document', completed: false },
        { id: 2, text: 'Request Letter of Recommendations (3)', type: 'External', completed: false },
        { id: 3, text: 'Upload Official Transcripts', type: 'Document', completed: false },
        { id: 4, text: 'Send GRE/TOEFL Scores', type: 'Score', completed: false },
        { id: 5, text: 'Complete Online Application Form', type: 'Form', completed: false },
        { id: 6, text: 'Pay Application Fee', type: 'Payment', completed: false },
    ]);

    useEffect(() => {
        const fetchLocked = async () => {
            try {
                const list = await getShortlist();
                const locked = list.filter(item => item.status === 'Locked');
                setLockedUniversities(locked);
            } catch (error) {
                console.error("Failed to fetch applications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLocked();
    }, []);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = (completedCount / tasks.length) * 100;

    const handleToggleTask = (id: number) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const [newTaskText, setNewTaskText] = useState('');

    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        const newTask = {
            id: Date.now(),
            text: newTaskText,
            type: 'Custom',
            completed: false
        };
        setTasks(prev => [...prev, newTask]);
        setNewTaskText('');
    };

    const handleDeleteTask = (id: number) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    if (loading) return <Box sx={{ p: 4 }}>Loading applications...</Box>;

    if (lockedUniversities.length === 0) {
        return (
            <Box sx={{ maxWidth: 800, mx: 'auto', mt: 8, textAlign: 'center' }}>
                <Box sx={{
                    width: 80, height: 80, borderRadius: '50%', bgcolor: '#eef2ff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 3
                }}>
                    <Mortarboard01Icon size={40} color="#6366f1" />
                </Box>
                <Typography variant="h4" fontWeight="800" color="#1e293b" gutterBottom>
                    No Active Applications
                </Typography>
                <Typography variant="body1" color="#64748b" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                    You haven't locked any universities yet. Go to your shortlist and lock a university to start the application process.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/shortlist')}
                    sx={{
                        bgcolor: '#6366f1', borderRadius: 3, px: 4, py: 1.5, fontWeight: 700,
                        '&:hover': { bgcolor: '#4f46e5' }
                    }}
                >
                    View Shortlist
                </Button>
            </Box>
        );
    }



    const currentUni = lockedUniversities[selectedTab];

    // Mocked Application Tasks (In a real app, fetched from DB per uni)
    // const APP_TASKS = [
    //     { id: 1, text: 'Finalize Statement of Purpose (SOP)', type: 'Document' },
    //     { id: 2, text: 'Request Letter of Recommendations (3)', type: 'External' },
    //     { id: 3, text: 'Upload Official Transcripts', type: 'Document' },
    //     { id: 4, text: 'Send GRE/TOEFL Scores', type: 'Score' },
    //     { id: 5, text: 'Complete Online Application Form', type: 'Form' },
    //     { id: 6, text: 'Pay Application Fee', type: 'Payment' },
    // ];

    return (
        <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="overline" fontWeight="700" color="#6366f1" sx={{ letterSpacing: '0.1em' }}>
                    APPLICATION PORTAL
                </Typography>
                <Typography variant="h3" fontWeight="800" color="#0f172a" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                    Manage Applications
                </Typography>
            </Box>

            {/* University Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    aria-label="university applications"
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                >
                    {lockedUniversities.map((item) => (
                        <Tab
                            key={item.id}
                            label={item.university?.name}
                            sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }}
                        />
                    ))}
                </Tabs>
            </Box>

            <Fade in={true} key={currentUni.id}>
                <Grid container spacing={4}>

                    {/* LEFT: Application Guide */}
                    <Grid item xs={12} lg={8}>

                        {/* Header Card */}
                        <Card sx={{ borderRadius: 5, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', mb: 4 }}>
                            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="h5" fontWeight="700" color="#1e293b" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                            {currentUni.university?.name}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                                            <Chip label="Master's Application" size="small" sx={{ bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, mb: 1 }} />
                                            <Chip label="Fall 2026" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 600, mb: 1 }} />
                                        </Stack>
                                        <Typography variant="body2" color="#64748b">
                                            Location: {currentUni.university?.location} • {currentUni.university?.country}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 2, md: 0 } }}>
                                        <Box sx={{ display: 'inline-block', textAlign: 'center', p: 2, bgcolor: '#fef2f2', borderRadius: 3, border: '1px solid #fee2e2', width: { xs: '100%', md: 'auto' } }}>
                                            <Typography variant="caption" fontWeight="700" color="#ef4444" sx={{ textTransform: 'uppercase' }}>Deadline</Typography>
                                            <Typography variant="h6" fontWeight="800" color="#b91c1c">Dec 15</Typography>
                                            <Typography variant="caption" color="#ef4444">45 Days Left</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Checklist Section */}
                        <Typography variant="h6" fontWeight="800" color="#1e293b" sx={{ mb: 2 }}>
                            Application Checklist
                        </Typography>
                        <Card sx={{ borderRadius: 5, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <CardContent sx={{ p: 0 }}>
                                {tasks.map((task) => (
                                    <Box key={task.id}
                                        onClick={() => handleToggleTask(task.id)}
                                        sx={{
                                            p: 3,
                                            borderBottom: '1px solid #f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            '&:last-child': { borderBottom: 'none' },
                                            transition: 'all 0.2s',
                                            bgcolor: task.completed ? '#f0fdf4' : 'transparent',
                                            '&:hover': {
                                                bgcolor: task.completed ? '#dcfce7' : '#f8fafc',
                                                '& .delete-icon': { opacity: 1 }
                                            }
                                        }}
                                    >
                                        <Checkbox
                                            checked={task.completed}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleToggleTask(task.id)}
                                            sx={{ '&.Mui-checked': { color: '#22c55e' } }}
                                        />
                                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                                            <Typography variant="body1" fontWeight="600" color={task.completed ? "#15803d" : "#334155"} sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                                                {task.text}
                                            </Typography>
                                            <Typography variant="caption" color="#94a3b8" fontWeight="500">{task.type}</Typography>
                                        </Box>
                                        <Box
                                            className="delete-icon"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                            sx={{
                                                p: 1,
                                                borderRadius: '50%',
                                                color: '#ef4444',
                                                opacity: { xs: 1, md: 0 },
                                                transition: 'all 0.2s',
                                                '&:hover': { bgcolor: '#fee2e2' }
                                            }}
                                        >
                                            <Delete02Icon size={18} />
                                        </Box>
                                    </Box>
                                ))}
                                {/* Add New Task Input */}
                                <Box sx={{ p: 3, display: 'flex', gap: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                    <input
                                        type="text"
                                        placeholder="Add a new task..."
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                        style={{
                                            flexGrow: 1,
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            outline: 'none',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleAddTask}
                                        disabled={!newTaskText.trim()}
                                        sx={{
                                            bgcolor: '#000000',
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            boxShadow: 'none',
                                            '&:hover': { bgcolor: '#000000ff', boxShadow: 'none' },
                                            '&.Mui-disabled': { bgcolor: '#ffffffff', color: '#ffffffff' }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>

                    </Grid>

                    {/* RIGHT: Timeline & Actions */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={3}>

                            {/* Status Card */}
                            <Card sx={{ borderRadius: 4, bgcolor: '#6366f1', color: 'white' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }} gutterBottom>Current Status</Typography>
                                    <Typography variant="h5" fontWeight="700" gutterBottom>
                                        {progress === 100 ? 'Ready to Submit' : 'In Progress'}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            '& .MuiLinearProgress-bar': { bgcolor: 'white' },
                                            height: 6,
                                            borderRadius: 3,
                                            mt: 2
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                                        {Math.round(progress)}% Complete
                                    </Typography>
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            <Card sx={{ borderRadius: 5, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight="700" color="#1e293b" sx={{ mb: 3 }}>Timeline</Typography>
                                    <Stack spacing={3}>
                                        {[
                                            { label: 'Preparation', status: 'done' },
                                            { label: 'Document Gathering', status: 'current' },
                                            { label: 'Application Submission', status: 'pending' },
                                            { label: 'Interview (if applicable)', status: 'pending' },
                                            { label: 'Decision', status: 'pending' }
                                        ].map((step, i) => (
                                            <Stack key={i} direction="row" spacing={2} alignItems="center">
                                                <Box sx={{
                                                    width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                                                    bgcolor: step.status === 'done' ? '#22c55e' : (step.status === 'current' ? '#6366f1' : '#e2e8f0'),
                                                    boxShadow: step.status === 'current' ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none'
                                                }} />
                                                <Typography variant="body2"
                                                    fontWeight={step.status === 'current' ? 700 : 500}
                                                    color={step.status === 'pending' ? '#94a3b8' : '#1e293b'}
                                                >
                                                    {step.label}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>

                        </Stack>
                    </Grid>

                </Grid>
            </Fade>
        </Box>
    );
};

export default ApplicationPage;
