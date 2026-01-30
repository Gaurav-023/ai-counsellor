import {
    Box,
    Typography,
    Grid,
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Stack,
    LinearProgress
} from '@mui/material';
import { useUniversities } from '../universities/hooks/useUniversities';
import { UniCard } from '../universities/components/UniCard';
import type { University } from '../../lib/types';
import { LockIcon, BookOpen01Icon, ArrowRight01Icon, SparklesIcon } from 'hugeicons-react';
import { UniCardSkeleton } from '../universities/components/UniCardSkeleton';
import { Skeleton } from '@mui/material';

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
    const progress = Math.min((lockedCount / Math.max(shortlist.length, 1)) * 100, 100);

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            {/* Header Section */}
            <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-end' }, gap: 3 }}>
                <Box>
                    <Typography variant="h3" fontWeight="800" color="#0f172a" sx={{ letterSpacing: '-0.03em', mb: 1.5 }}>
                        Your Shortlist & Strategy
                    </Typography>
                    <Typography variant="body1" color="#64748b" sx={{ fontSize: '1.1rem', maxWidth: 600 }}>
                        Review your selected universities. Lock your top choices to unlock the comprehensive application roadmap and AI-guided essay features.
                    </Typography>
                </Box>

                {/* Progress Widget */}
                {shortlist.length > 0 && (
                    <Card sx={{ minWidth: 280, p: 2, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" fontWeight="700" color="#475569" textTransform="uppercase">Strategy Progress</Typography>
                            <Typography variant="caption" fontWeight="800" color="#0f172a">{Math.round(progress)}% Ready</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#0f172a' } }} />
                    </Card>
                )}
            </Box>

            {/* Content Area */}
            {loading ? (
                <Grid container spacing={4}>
                    {[1, 2].map((i) => (
                        <Grid item xs={12} key={i}>
                            <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
                                <Box sx={{ flex: 1, maxWidth: { lg: 420 } }}><UniCardSkeleton /></Box>
                                <Box sx={{ flex: 2 }}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} /></Box>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            ) : error ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
            ) : shortlist.length === 0 ? (
                <Box sx={{
                    textAlign: 'center', py: 12, px: 2,
                    bgcolor: '#f8fafc', borderRadius: 6, border: '2px dashed #e2e8f0',
                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                    <Box sx={{ bgcolor: 'white', p: 2, borderRadius: '50%', mb: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <BookOpen01Icon size={32} color="#94a3b8" />
                    </Box>
                    <Typography variant="h5" fontWeight="800" color="#0f172a" gutterBottom>No universities shortlisted yet</Typography>
                    <Typography color="#64748b" sx={{ mb: 4, maxWidth: 400 }}>Start exploring universities and add them to your Dream, Target, or Safe list to build your strategy.</Typography>
                    <Button
                        variant="contained"
                        size="large"
                        href="/universities"
                        sx={{
                            bgcolor: '#0f172a', color: 'white', borderRadius: 3, fontWeight: 700, px: 4, py: 1.5,
                            '&:hover': { bgcolor: '#334155' }
                        }}
                    >
                        Browse Universities
                    </Button>
                </Box>
            ) : (
                <Stack spacing={6}>
                    {shortlist.map((item, index) => {
                        const uni = item.university;
                        if (!uni) return null;

                        const isLocked = item.status === 'Locked';
                        const displayUni: University = {
                            ...uni,
                            ai_classification: item.category
                        };

                        return (
                            <Box key={item.id} sx={{ position: 'relative' }}>
                                {/* Connector Line (visual flourish for list) */}
                                {index !== shortlist.length - 1 && (
                                    <Box sx={{
                                        position: 'absolute', left: { lg: 210 }, bottom: -48, top: '100%', width: 2, bgcolor: '#f1f5f9',
                                        display: { xs: 'none', lg: 'block' }
                                    }} />
                                )}

                                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
                                    {/* University Card (Left) */}
                                    <Box sx={{ flex: 1, maxWidth: { lg: 420 }, minWidth: { lg: 380 } }}>
                                        <UniCard
                                            uni={displayUni}
                                            isShortlisted={true}
                                            onShortlist={handleShortlist}
                                            onRemove={() => handleRemove(item.university_id)}
                                            // New Locking Props
                                            isLocked={isLocked}
                                            onLock={handleLock}
                                            onUnlock={handleUnlock}
                                            shortlistId={item.id}
                                        />
                                    </Box>

                                    {/* Guidance Panel (Right) */}
                                    <Box sx={{ flex: 2 }}>
                                        <Card sx={{
                                            height: '100%',
                                            borderRadius: 5,
                                            border: '1px solid',
                                            borderColor: isLocked ? '#e2e8f0' : '#f1f5f9',
                                            bgcolor: 'white',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            boxShadow: isLocked
                                                ? '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                                                : 'none'
                                        }}>
                                            {/* Locked Overlay */}
                                            {!isLocked && (
                                                <Box sx={{
                                                    position: 'absolute', inset: 0,
                                                    bgcolor: 'rgba(255,255,255,0.85)',
                                                    backdropFilter: 'blur(8px)',
                                                    zIndex: 10,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexDirection: 'column', gap: 2.5
                                                }}>
                                                    <Box sx={{
                                                        width: 64, height: 64, borderRadius: '50%', bgcolor: '#f1f5f9',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <LockIcon size={28} color="#64748b" />
                                                    </Box>
                                                    <Box textAlign="center">
                                                        <Typography variant="h6" fontWeight="800" color="#0f172a">Guidance Locked</Typography>
                                                        <Typography variant="body2" color="#64748b" sx={{ maxWidth: 300, mx: 'auto', mt: 1 }}>
                                                            Lock this university in your list (left) to reveal your personalized application roadmap.
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}

                                            <CardContent sx={{
                                                p: { xs: 3, md: 5 },
                                                flexGrow: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                '&:last-child': { pb: { xs: 3, md: 5 } } // Override MUI default extra padding
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                                                    <Box>
                                                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                            <SparklesIcon size={18} color="#f59e0b" />
                                                            <Typography variant="caption" fontWeight="700" color="#f59e0b" textTransform="uppercase">
                                                                AI Strategy Included
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant="h5" fontWeight="800" color="#0f172a">
                                                            Application Roadmap
                                                        </Typography>
                                                        <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>
                                                            Your step-by-step game plan for {uni.name}.
                                                        </Typography>
                                                    </Box>

                                                    <Chip
                                                        label="Fall 2026 Intake"
                                                        sx={{ bgcolor: '#f1f5f9', fontWeight: 700, color: '#475569', borderRadius: 2 }}
                                                    />
                                                </Box>

                                                <Divider sx={{ mb: 4, borderStyle: 'dashed' }} />

                                                <Grid container spacing={3}>
                                                    {[
                                                        { step: 1, title: 'Profile Analysis', desc: 'AI verified match strength.' },
                                                        { step: 2, title: 'Draft Essays', desc: 'Brainstorm personal statement.' },
                                                        { step: 3, title: 'Documents', desc: 'Gather transcripts & LORs.' },
                                                        { step: 4, title: 'Final Review', desc: 'Submit before deadline.' }
                                                    ].map((item) => (
                                                        <Grid item xs={12} sm={6} key={item.step}>
                                                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                                                <Box sx={{
                                                                    minWidth: 32, height: 32, borderRadius: '50%',
                                                                    bgcolor: '#0f172a', color: 'white',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontWeight: 700, fontSize: '0.9rem'
                                                                }}>
                                                                    {item.step}
                                                                </Box>
                                                                <Box>
                                                                    <Typography variant="subtitle2" fontWeight="700" color="#0f172a">
                                                                        {item.title}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="#64748b" display="block">
                                                                        {item.desc}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </Grid>
                                                    ))}
                                                </Grid>

                                                <Box sx={{ mt: 'auto', pt: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight="800" color="#0f172a">Ready to Apply?</Typography>
                                                            <Typography variant="caption" color="#64748b">Portals open for Fall 2026</Typography>
                                                        </Box>
                                                    </Box>

                                                    <Button
                                                        variant="contained"
                                                        size="large"
                                                        href={uni.website_url || "/application"} // Use Uni URL if available
                                                        target="_blank"
                                                        endIcon={<ArrowRight01Icon size={18} />}
                                                        sx={{
                                                            bgcolor: '#000000', // PURE BLACK as requested
                                                            color: '#ffffff',   // PURE WHITE as requested
                                                            fontWeight: 700,
                                                            px: 3, py: 1.5,
                                                            minHeight: 56, // Match height visual
                                                            borderRadius: 3,
                                                            textTransform: 'none',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                            '&:hover': {
                                                                bgcolor: '#333333',
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                                            },
                                                            transition: 'all 0.2s ease',
                                                            width: { xs: '100%', sm: 'auto' }
                                                        }}
                                                    >
                                                        Go to Application Portal
                                                    </Button>
                                                </Box>

                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Container>
    );
};

export default ShortlistPage;
