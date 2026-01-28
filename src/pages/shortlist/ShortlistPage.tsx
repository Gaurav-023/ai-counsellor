import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Button,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import { useUniversities } from '../universities/hooks/useUniversities';
import { UniCard } from '../universities/components/UniCard';
import type { University } from '../../lib/types';
import { Clock01Icon, BookOpen01Icon, CheckmarkCircle01Icon } from 'hugeicons-react';

const ShortlistPage = () => {
    const {
        shortlist,
        loading,
        error,
        handleRemove,
        handleShortlist,
        handleLock,
        handleUnlock
    } = useUniversities();

    const lockedCount = shortlist.filter(s => s.status === 'Locked').length;

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 8 }}>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" fontWeight="800" color="#0f172a" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                    Your Shortlist & Strategy
                </Typography>
                <Typography variant="body1" color="#64748b" sx={{ mb: 2 }}>
                    Review your shortlisted "Dream", "Target", and "Safe" universities.
                </Typography>

                {/* Locking Instructions */}
                <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 3, border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 2, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                        <Clock01Icon color="#2563eb" size={24} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="700" color="#1e40af">
                            Lock your choices to unlock guidance
                        </Typography>
                        <Typography variant="caption" color="#1e3a8a">
                            You must lock at least 1 university to start the application process and access custom essay roadmaps.
                        </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                        <Chip
                            label={`${lockedCount} Locked`}
                            color={lockedCount > 0 ? "success" : "default"}
                            variant="filled"
                            size="small"
                            sx={{ fontWeight: 700 }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                    <CircularProgress size={40} sx={{ color: '#f97316' }} />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : shortlist.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography color="text.secondary">No universities shortlisted yet.</Typography>
                    <Button variant="contained" sx={{ mt: 2 }} href="/universities">Browse Universities</Button>
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {shortlist.map(item => {
                        const uni = item.university;
                        if (!uni) return null;

                        const isLocked = item.status === 'Locked';
                        const displayUni: University = {
                            ...uni,
                            ai_classification: item.category
                        };

                        return (
                            <Grid item xs={12} key={item.id}>
                                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                                    {/* University Card (Left) */}
                                    <Box sx={{ flex: 1, maxWidth: { lg: 400 } }}>
                                        <UniCard
                                            uni={displayUni}
                                            isShortlisted={true}
                                            onShortlist={handleShortlist}
                                            onRemove={() => handleRemove(item.university_id)}
                                            showEvaluation={true} // Always show evaluation here
                                        />

                                        {/* Lock Action Block */}
                                        <Box sx={{ mt: 2, p: 2, bgcolor: isLocked ? '#f0fdf4' : 'white', borderRadius: 3, border: `1px solid ${isLocked ? '#bbf7d0' : '#e2e8f0'}`, textAlign: 'center' }}>
                                            {isLocked ? (
                                                <>
                                                    <Typography variant="subtitle2" fontWeight="700" color="#166534" sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <CheckmarkCircle01Icon size={18} /> Locked & Ready
                                                    </Typography>
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        color="inherit"
                                                        onClick={() => handleUnlock(item.id)}
                                                        sx={{ fontSize: '0.75rem', color: '#64748b' }}
                                                    >
                                                        Unlock to edit
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => handleLock(item.id)}
                                                    startIcon={<Clock01Icon size={18} />}
                                                    sx={{
                                                        bgcolor: '#0f172a',
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        '&:hover': { bgcolor: '#334155' }
                                                    }}
                                                >
                                                    Lock University
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Guidance Panel (Right) - UNLOCKED STATE */}
                                    <Box sx={{ flex: 2 }}>
                                        <Card sx={{
                                            height: '100%',
                                            borderRadius: 4,
                                            border: '1px solid',
                                            borderColor: isLocked ? '#cbd5e1' : '#e2e8f0',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            bgcolor: isLocked ? 'white' : '#f8fafc'
                                        }}>
                                            {!isLocked && (
                                                <Box sx={{
                                                    position: 'absolute', inset: 0,
                                                    bgcolor: 'rgba(255,255,255,0.6)',
                                                    backdropFilter: 'blur(4px)',
                                                    zIndex: 10,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexDirection: 'column', gap: 2
                                                }}>
                                                    <Clock01Icon size={48} color="#94a3b8" />
                                                    <Typography fontWeight="700" color="#64748b">Lock this university to view guidance map</Typography>
                                                </Box>
                                            )}

                                            <CardContent sx={{ p: 4 }}>
                                                <Typography variant="h6" fontWeight="800" gutterBottom display="flex" alignItems="center" gap={1}>
                                                    <BookOpen01Icon color="#f97316" /> Application Roadmap
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    Step-by-step guide to applying to {uni.name}.
                                                </Typography>

                                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                                    {['Review Requirements', 'Draft Personal Statement', 'Request Recommendation Letters', 'Submit Application'].map((step, idx) => (
                                                        <Grid item xs={12} sm={6} key={idx}>
                                                            <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, bgcolor: '#f1f5f9' }}>
                                                                <Typography variant="caption" fontWeight="700" color="#64748b">STEP {idx + 1}</Typography>
                                                                <Typography variant="subtitle2" fontWeight="600">{step}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

export default ShortlistPage;
