import { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Building02Icon,
    CheckmarkCircle01Icon,
    LockIcon,
    SquareUnlock02Icon,
    Globe02Icon,
    Location01Icon
} from 'hugeicons-react';
import type { University } from '../../../lib/types';

interface UniCardProps {
    uni: University;
    isShortlisted: boolean;
    onShortlist: (id: string, category: 'Dream' | 'Target' | 'Safe') => void;
    onRemove: (id: string) => void;
    showEvaluation?: boolean;
    shortlistCategory?: 'Dream' | 'Target' | 'Safe';
    isLocked?: boolean;
    onLock?: (id: string) => void;
    onUnlock?: (id: string) => void;
    shortlistId?: string;
}

export const UniCard = ({
    uni,
    isShortlisted,
    onShortlist,
    onRemove,
    shortlistCategory,
    isLocked = false,
    onLock,
    onUnlock,
    shortlistId
}: UniCardProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Dialog State
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'lock' | 'unlock' | null>(null);

    const open = Boolean(anchorEl);

    // AI Classification
    const aiCategory = uni.ai_classification || 'Target';

    // Badge Colors
    const getBadgeColor = (cat: string) => {
        if (cat === 'Dream') return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' };
        if (cat === 'Safe') return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
    };

    const badgeStyle = getBadgeColor(aiCategory);
    const userShortlistStyle = shortlistCategory ? getBadgeColor(shortlistCategory) : { bg: '#dcfce7', color: '#16a34a', border: 'transparent' };

    const handleShortlistClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const handleSelect = (cat: 'Dream' | 'Target' | 'Safe') => {
        onShortlist(uni.id, cat);
        handleClose();
    };

    // Dialog Handlers
    const handleLockClick = () => { setDialogAction('lock'); setConfirmDialogOpen(true); };
    const handleUnlockClick = () => { setDialogAction('unlock'); setConfirmDialogOpen(true); };

    const handleConfirmAction = () => {
        if (dialogAction === 'lock' && onLock && shortlistId) onLock(shortlistId);
        else if (dialogAction === 'unlock' && onUnlock && shortlistId) onUnlock(shortlistId);
        setConfirmDialogOpen(false);
    };

    return (
        <Card sx={{
            borderRadius: 5,
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                borderColor: '#e2e8f0'
            }
        }}>
            {/* 1. Banner Image */}
            <Box sx={{ position: 'relative', height: 140, overflow: 'hidden' }}>
                <CardMedia
                    component="img"
                    height="140"
                    image={uni.banner_url || "/1.webp"}
                    alt={uni.name}
                    sx={{
                        filter: 'brightness(0.9)',
                        transition: 'transform 0.5s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                    }}
                />
                <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)'
                }} />

                {/* AI Badge on Banner */}
                <Chip
                    label={aiCategory}
                    size="small"
                    sx={{
                        position: 'absolute', top: 12, right: 12,
                        bgcolor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(4px)',
                        color: badgeStyle.color,
                        fontWeight: 800,
                        borderRadius: 2,
                        border: `1px solid ${badgeStyle.border}`,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                />
            </Box>

            <CardContent sx={{ p: 2.5, pt: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 2. Overlapping Logo & Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: -4, mb: 1, px: 0.5 }}>
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 64, height: 64,
                            bgcolor: 'white',
                            color: '#f97316',
                            borderRadius: 3,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #f8fafc'
                        }}
                    >
                        <Building02Icon size={32} />
                    </Avatar>

                    {/* Quick Action Icon Button */}
                    {uni.website_url && (
                        <Tooltip title="Visit Website">
                            <IconButton
                                size="small"
                                href={uni.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    bgcolor: 'white',
                                    border: '1px solid #e2e8f0',
                                    color: '#64748b',
                                    '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' }
                                }}
                            >
                                <Globe02Icon size={18} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Name & Location */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2, mb: 0.5, fontSize: '1.1rem', color: '#0f172a' }}>
                        {uni.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Location01Icon size={14} color="#64748b" />
                        <Typography variant="body2" color="text.secondary" fontWeight="600">
                            {uni.location}, {uni.country}
                        </Typography>
                    </Stack>
                </Box>

                {/* 3. Degree Chips */}
                {uni.degree_levels && uni.degree_levels.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2.5 }}>
                        {uni.degree_levels.map((deg) => (
                            <Chip
                                key={deg}
                                label={deg}
                                size="small"
                                sx={{
                                    borderRadius: 1.5,
                                    bgcolor: '#f1f5f9',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    height: 24
                                }}
                            />
                        ))}
                    </Stack>
                )}

                <Divider sx={{ mb: 2.5, borderStyle: 'dashed' }} />

                {/* 4. Key Metrics Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2.5 }}>
                    <Box>
                        <Typography variant="caption" color="#64748b" fontWeight="600" display="block">Global Rank</Typography>
                        <Typography variant="subtitle2" fontWeight="800" color="#0f172a">
                            #{uni.ranking || 'N/A'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="#64748b" fontWeight="600" display="block">Acceptance</Typography>
                        <Typography variant="subtitle2" fontWeight="800" color={uni.acceptance_rate && uni.acceptance_rate < 0.2 ? '#ef4444' : '#0f172a'}>
                            {uni.acceptance_rate ? `${(uni.acceptance_rate * 100).toFixed(0)}%` : 'N/A'}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="#64748b" fontWeight="600" display="block">Tuition</Typography>
                        <Typography variant="subtitle2" fontWeight="800" color="#0f172a">
                            {uni.tuition_fee ? `$${(uni.tuition_fee / 1000).toFixed(0)}k` : uni.cost_range}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="#64748b" fontWeight="600" display="block">Match</Typography>
                        <Typography variant="subtitle2" fontWeight="800" color="#f97316">
                            92%
                        </Typography>
                    </Box>
                </Box>

                {/* 5. Footer Actions */}
                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {isShortlisted ? (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => onRemove(uni.id)}
                            startIcon={<CheckmarkCircle01Icon size={18} />}
                            sx={{
                                borderColor: userShortlistStyle.border,
                                bgcolor: userShortlistStyle.bg,
                                color: userShortlistStyle.color,
                                borderRadius: 3,
                                fontWeight: 700,
                                textTransform: 'none',
                                py: 1.2,
                                '&:hover': {
                                    bgcolor: '#fef2f2', borderColor: '#fee2e2', color: '#ef4444'
                                }
                            }}
                        >
                            {shortlistCategory ? `${shortlistCategory} List` : 'Shortlisted'}
                        </Button>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleShortlistClick}
                                sx={{
                                    bgcolor: '#0f172a',
                                    color: 'white',
                                    borderRadius: 3, // Match card radius curve style
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    py: 1.2,
                                    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)',
                                    '&:hover': { bgcolor: '#334155', transform: 'translateY(-1px)' }
                                }}
                            >
                                Shortlist
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                PaperProps={{ elevation: 10, sx: { borderRadius: 3, mt: 1, minWidth: 140 } }}
                            >
                                <MenuItem onClick={() => handleSelect('Dream')} sx={{ fontWeight: 600, color: '#dc2626', gap: 1 }}><Box width={8} height={8} borderRadius="50%" bgcolor="#dc2626" /> Dream</MenuItem>
                                <MenuItem onClick={() => handleSelect('Target')} sx={{ fontWeight: 600, color: '#2563eb', gap: 1 }}><Box width={8} height={8} borderRadius="50%" bgcolor="#2563eb" /> Target</MenuItem>
                                <MenuItem onClick={() => handleSelect('Safe')} sx={{ fontWeight: 600, color: '#16a34a', gap: 1 }}><Box width={8} height={8} borderRadius="50%" bgcolor="#16a34a" /> Safe</MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Box>
            </CardContent>

            {/* Lock Button Section (Integrated into Match Score area) */}
            {onLock && onUnlock && shortlistId && (
                <Box sx={{ mb: 2, mx: 2, p: 1, border: '1px dashed #cbd5e1', borderRadius: 2, display: 'flex', justifyContent: 'center' }}>
                    {isLocked ? (
                        <Button
                            size="small"
                            color="inherit"
                            onClick={handleUnlockClick}
                            startIcon={<SquareUnlock02Icon size={16} />}
                            sx={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'none' }}
                        >
                            Unlock University
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleLockClick}
                            startIcon={<LockIcon size={16} />}
                            sx={{
                                bgcolor: '#0f172a',
                                color: 'white',
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#334155' }
                            }}
                        >
                            Lock University
                        </Button>
                    )}
                </Box>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {dialogAction === 'lock' ? 'Lock this University?' : 'Unlock University?'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogAction === 'lock'
                            ? "Locking this university will unlock your detailed application roadmap and specific guidance. You can unlock it later if needed."
                            : "Unlocking will hide the specific application guidance. Are you sure you want to proceed?"
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={dialogAction === 'lock' ? "primary" : "warning"}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                        Confirm {dialogAction === 'lock' ? 'Lock' : 'Unlock'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};
