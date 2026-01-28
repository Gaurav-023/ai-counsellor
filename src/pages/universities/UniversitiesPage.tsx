import {
    Box,
    Typography,
    Grid,
    Pagination,
    PaginationItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { useUniversities } from './hooks/useUniversities';
import { UniCard } from './components/UniCard';
import { UniFilters } from './components/UniFilters';

const UniversitiesPage = () => {
    const {
        universities,
        totalUniversities,
        shortlist,
        loading,
        error,
        filters,
        page,
        totalPages,
        setPage,
        handleFilterChange,
        handleShortlist,
        handleRemove
    } = useUniversities();

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 8 }}>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" fontWeight="800" color="#0f172a" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                    University Recommendations
                </Typography>
                <Typography variant="body1" color="#64748b">
                    {totalUniversities > 0 ? `${totalUniversities} universities available` : 'AI-curated recommendations'} based on your profile, budget, and competition level.
                </Typography>
            </Box>

            {/* Filters */}
            <UniFilters filters={filters} onChange={handleFilterChange} />

            {/* Content */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
                    <CircularProgress size={40} sx={{ color: '#f97316' }} />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : universities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography color="text.secondary">No universities found.</Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {universities.map(uni => {
                            const isShortlisted = shortlist.some(s => s.university_id === uni.id);
                            return (
                                <Grid item xs={12} md={6} lg={4} xl={4} key={uni.id}>
                                    <UniCard
                                        uni={uni}
                                        isShortlisted={isShortlisted}
                                        onShortlist={handleShortlist}
                                        onRemove={handleRemove}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Ant Design Style Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, v) => {
                                setPage(v);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            shape="rounded"
                            renderItem={(item) => (
                                <PaginationItem
                                    {...item}
                                    sx={{
                                        border: '1px solid #e2e8f0',
                                        bgcolor: 'white',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#f8fafc' },
                                        '&.Mui-selected': {
                                            bgcolor: '#f97316',
                                            color: 'white',
                                            borderColor: '#f97316',
                                            '&:hover': { bgcolor: '#ea580c' }
                                        }
                                    }}
                                />
                            )}
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontFamily: 'inherit',
                                    fontWeight: 600,
                                    color: '#64748b',
                                    border: '1px solid #e2e8f0',
                                    bgcolor: 'white',
                                    transition: 'all 0.2s',
                                    borderRadius: 2
                                },
                                '& .Mui-selected': {
                                    bgcolor: '#f97316 !important',
                                    color: 'white !important',
                                    borderColor: '#f97316 !important',
                                    boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)'
                                }
                            }}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
};

export default UniversitiesPage;
