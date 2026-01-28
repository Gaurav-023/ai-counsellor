import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Divider,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';
import { UniversityIcon, CheckmarkCircle01Icon, AlertCircleIcon, Idea01Icon } from 'hugeicons-react';
import type { University } from '../../../lib/types';

interface UniCardProps {
    uni: University;
    isShortlisted: boolean;
    onShortlist: (id: string, category: 'Dream' | 'Target' | 'Safe') => void;
    onRemove: (id: string) => void;
    showEvaluation?: boolean; // New prop to show expanded evaluation data
}

export const UniCard = ({ uni, isShortlisted, onShortlist, onRemove, showEvaluation = false }: UniCardProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [expanded, setExpanded] = useState(false); // Toggle for details
    const open = Boolean(anchorEl);

    // AI Classification
    const aiCategory = uni.ai_classification || 'Target';

    // Determine badge color based on category
    const getBadgeColor = (cat: string) => {
        if (cat === 'Dream') return { bg: '#fee2e2', color: '#dc2626' }; // Red
        if (cat === 'Safe') return { bg: '#dcfce7', color: '#16a34a' }; // Green
        return { bg: '#eff6ff', color: '#2563eb' }; // Blue (Target)
    };

    const badgeStyle = getBadgeColor(aiCategory);

    const handleShortlistClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleSelect = (cat: 'Dream' | 'Target' | 'Safe') => {
        onShortlist(uni.id, cat);
        handleClose();
    };

    return (
        <Card sx={{
            borderRadius: 4,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
            border: '1px solid #f1f5f9',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'visible',
            '&:hover': {
                borderColor: '#fdba74',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-4px)',
                zIndex: 10 // Ensure hover pops over others
            }
        }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar
                            variant="rounded"
                            sx={{
                                bgcolor: '#ffedd5', // Light orange
                                color: '#f97316', // Orange
                                borderRadius: 3,
                                width: 48, height: 48
                            }}
                        >
                            <UniversityIcon size={24} />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2, mb: 0.5, fontSize: '1rem' }}>
                                {uni.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="600">
                                {uni.location}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Badge */}
                    <Chip
                        label={aiCategory}
                        size="small"
                        sx={{
                            bgcolor: badgeStyle.bg,
                            color: badgeStyle.color,
                            fontWeight: 700,
                            borderRadius: 2
                        }}
                    />
                </Box>

                <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

                {/* Details List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">Global Ranking</Typography>
                        <Typography variant="body2" fontWeight="700">#{uni.ranking || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">Acceptance Rate</Typography>
                        <Typography variant="body2" fontWeight="700">
                            {uni.acceptance_rate ? `${(uni.acceptance_rate * 100).toFixed(0)}%` : 'N/A'}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">Avg. Tuition</Typography>
                        <Typography variant="body2" fontWeight="700">
                            {uni.tuition_fee ? `$${uni.tuition_fee.toLocaleString()}` : uni.cost_range}
                        </Typography>
                    </Box>
                </Box>

                {/* Evaluation Section (Visible if showEvaluation is true OR expanded) */}
                {(showEvaluation || expanded) && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                        <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                            <Idea01Icon size={16} color="#f59e0b" style={{ marginTop: 2 }} />
                            <Box>
                                <Typography variant="caption" fontWeight="800" color="#f59e0b" sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                    Match Reason
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                                    {uni.fit_reason || "Based on your academic profile match."}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <AlertCircleIcon size={16} color="#ef4444" style={{ marginTop: 2 }} />
                            <Box>
                                <Typography variant="caption" fontWeight="800" color="#ef4444" sx={{ textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                    Potential Risk
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                                    {uni.risks || "Cost of living may be higher than average."}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Match Score */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" fontWeight="700" color="#64748b">Match Score</Typography>
                    <Typography variant="h6" fontWeight="800" color="#f97316">92%</Typography>
                </Box>

                {/* Buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        fullWidth
                        onClick={() => setExpanded(!expanded)}
                        sx={{
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            borderRadius: 3,
                            fontWeight: 700,
                            textTransform: 'none',
                            py: 1
                        }}
                    >
                        {expanded ? 'Hide Info' : 'Details'}
                    </Button>

                    {isShortlisted ? (
                        <Button
                            fullWidth
                            onClick={() => onRemove(uni.id)}
                            startIcon={<CheckmarkCircle01Icon size={18} />}
                            sx={{
                                bgcolor: '#dcfce7',
                                color: '#16a34a',
                                borderRadius: 3,
                                fontWeight: 700,
                                textTransform: 'none',
                                py: 1,
                                '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' }
                            }}
                        >
                            Added
                        </Button>
                    ) : (
                        <>
                            <Button
                                fullWidth
                                onClick={handleShortlistClick}
                                sx={{
                                    bgcolor: '#f97316',
                                    color: 'white',
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    py: 1,
                                    boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2)',
                                    '&:hover': { bgcolor: '#ea580c' }
                                }}
                            >
                                Shortlist
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                PaperProps={{ elevation: 4, sx: { borderRadius: 3, mt: 1 } }}
                            >
                                <MenuItem onClick={() => handleSelect('Dream')} sx={{ fontWeight: 600, color: '#dc2626' }}>As Dream</MenuItem>
                                <MenuItem onClick={() => handleSelect('Target')} sx={{ fontWeight: 600, color: '#2563eb' }}>As Target</MenuItem>
                                <MenuItem onClick={() => handleSelect('Safe')} sx={{ fontWeight: 600, color: '#16a34a' }}>As Safe</MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
