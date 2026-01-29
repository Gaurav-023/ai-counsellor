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
import { LockIcon, BookOpen01Icon } from 'hugeicons-react';

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
                        <LockIcon color="#2563eb" size={24} />
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
                                            showEvaluation={true}
                                            // New Locking Props
                                            isLocked={isLocked}
                                            onLock={handleLock}
                                            onUnlock={handleUnlock}
                                            shortlistId={item.id}
                                        />
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
                                                    <LockIcon size={48} color="#94a3b8" />
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

                                                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #f1f5f9' }}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        href="/application"
                                                        endIcon={<BookOpen01Icon size={18} />}
                                                        sx={{
                                                            bgcolor: '#1e3a8a',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                            py: 1.5,
                                                            '&:hover': { bgcolor: '#172554' }
                                                        }}
                                                    >
                                                        Go to Application Portal
                                                    </Button>
                                                </Box>
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
