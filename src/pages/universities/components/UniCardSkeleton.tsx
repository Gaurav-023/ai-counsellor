import { Box, Card, CardContent, Skeleton, Divider } from '@mui/material';

export const UniCardSkeleton = () => {
    return (
        <Card sx={{
            borderRadius: 4,
            border: '1px solid #f1f5f9',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                        {/* Avatar */}
                        <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 3 }} />
                        <Box sx={{ flex: 1 }}>
                            {/* Title */}
                            <Skeleton variant="text" width="80%" height={32} />
                            {/* Subtitle */}
                            <Skeleton variant="text" width="40%" height={24} />
                        </Box>
                    </Box>
                    {/* Badge */}
                    <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 2 }} />
                </Box>

                <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                {/* Details List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Skeleton variant="text" width={100} />
                            <Skeleton variant="text" width={60} />
                        </Box>
                    ))}
                </Box>

                {/* Match Score */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={40} height={32} />
                </Box>

                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: 3 }} />
                    <Skeleton variant="rounded" width="100%" height={40} sx={{ borderRadius: 3 }} />
                </Box>
            </CardContent>
        </Card>
    );
};
