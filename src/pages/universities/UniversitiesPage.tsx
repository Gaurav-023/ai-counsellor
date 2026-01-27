import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Tabs,
    Tab,
    Stack,
    Menu,
    MenuItem,
    Divider,
    Alert
} from '@mui/material';
import {
    BookmarkAdd02Icon,
    Delete02Icon,
    LockKeyIcon,
    CheckmarkCircle01Icon,
    UniversityIcon
} from 'hugeicons-react'; // Check imports
import { getUniversities, getShortlist, addToShortlist, removeFromShortlist, updateShortlistStatus } from '../../lib/api';
import type { University, ShortlistItem } from '../../lib/types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const UniversitiesPage = () => {
    const [value, setValue] = useState(0);
    const [universities, setUniversities] = useState<University[]>([]);
    const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadData = async () => {
        try {
            const [unis, list] = await Promise.all([getUniversities(), getShortlist()]);
            setUniversities(unis);
            setShortlist(list);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleShortlist = async (uniId: string, category: 'Dream' | 'Target' | 'Safe') => {
        try {
            await addToShortlist(uniId, category);
            await loadData(); // Refresh
        } catch (err: any) {
            console.error(err);
            alert('Could not shortlist: ' + err.message);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove from shortlist?')) return;
        try {
            await removeFromShortlist(id);
            await loadData();
        } catch (err) { console.error(err); }
    };

    const handleLock = async (id: string) => {
        if (!confirm('Lock this university? This will unlock application tasks.')) return;
        try {
            await updateShortlistStatus(id, 'Locked');
            await loadData();
        } catch (err) { console.error(err); }
    };

    // --- Sub Components ---

    const UniCard = ({ uni, isShortlisted = false }: { uni: University, isShortlisted?: boolean }) => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const open = Boolean(anchorEl);

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
        };

        const onSelectCategory = (cat: 'Dream' | 'Target' | 'Safe') => {
            handleShortlist(uni.id, cat);
            handleClose();
        };

        return (
            <Grid item xs={12} md={6} lg={4}>
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UniversityIcon size={24} color="#64748b" />
                                </div>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>{uni.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{uni.location}, {uni.country}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip label={`Rank #${uni.ranking}`} size="small" variant="outlined" />
                            <Chip label={`${(uni.acceptance_rate * 100).toFixed(0)}% Acceptance`} size="small" variant="outlined" />
                            {uni.cost_range && <Chip label={uni.cost_range + ' Cost'} size="small" variant="outlined" color={uni.cost_range === 'High' ? 'warning' : 'success'} />}
                        </Stack>

                        <Box sx={{ mt: 2 }}>
                            {uni.tags && uni.tags.map(t => (
                                <Chip key={t} label={t} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: '#f8fafc' }} />
                            ))}
                        </Box>
                    </CardContent>

                    <Divider />

                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        {isShortlisted ? (
                            <Button disabled startIcon={<CheckmarkCircle01Icon size={18} />}>Shortlisted</Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<BookmarkAdd02Icon size={18} />}
                                    onClick={handleClick}
                                    size="small"
                                >
                                    Shortlist
                                </Button>
                                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                                    <MenuItem onClick={() => onSelectCategory('Dream')}>As Dream</MenuItem>
                                    <MenuItem onClick={() => onSelectCategory('Target')}>As Target</MenuItem>
                                    <MenuItem onClick={() => onSelectCategory('Safe')}>As Safe</MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Card>
            </Grid>
        );
    };

    const ShortlistCard = ({ item }: { item: ShortlistItem }) => {
        if (!item.university) return null;
        const uni = item.university;
        const isLocked = item.status === 'Locked';

        return (
            <Grid item xs={12}>
                <Card sx={{
                    borderRadius: 3,
                    border: isLocked ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    boxShadow: 'none',
                    bgcolor: isLocked ? '#f5f3ff' : 'white'
                }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{
                                width: 40, height: 40,
                                borderRadius: '50%',
                                bgcolor: item.category === 'Dream' ? '#fef2f2' : (item.category === 'Target' ? '#eff6ff' : '#f0fdf4'),
                                color: item.category === 'Dream' ? '#ef4444' : (item.category === 'Target' ? '#3b82f6' : '#22c55e'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem'
                            }}>
                                {item.category[0]}
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">{uni.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.category} • {item.status}</Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {!isLocked ? (
                                <>
                                    <Button
                                        variant="text"
                                        color="error"
                                        onClick={() => handleRemove(item.id)}
                                        startIcon={<Delete02Icon size={18} />}
                                    >
                                        Remove
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleLock(item.id)}
                                        startIcon={<LockKeyIcon size={18} />}
                                    >
                                        Lock
                                    </Button>
                                </>
                            ) : (
                                <Chip label="Locked & Active" color="primary" icon={<LockKeyIcon size={14} />} />
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    if (loading) return <Box sx={{ p: 4 }}>Loading universities...</Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" color="#1e293b">Universities</Typography>
                {/* Search Bar could go here */}
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={(_, v) => setValue(v)}>
                    <Tab label="Discover" />
                    <Tab label={`My Shortlist (${shortlist.length})`} />
                </Tabs>
            </Box>

            <CustomTabPanel value={value} index={0}>
                <Grid container spacing={3}>
                    {universities.map(uni => {
                        const isShortlisted = shortlist.some(s => s.university_id === uni.id);
                        return <UniCard key={uni.id} uni={uni} isShortlisted={isShortlisted} />;
                    })}
                </Grid>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
                <Grid container spacing={2}>
                    {shortlist.length === 0 ? (
                        <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>No universities shortlisted yet. Go to Discover!</Typography>
                    ) : (
                        shortlist.map(item => (
                            <ShortlistCard key={item.id} item={item} />
                        ))
                    )}
                </Grid>
            </CustomTabPanel>
        </Box>
    );
};

export default UniversitiesPage;
