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
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    UniversityIcon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    Idea01Icon,
    LockIcon,
    SquareUnlock02Icon
} from 'hugeicons-react';
import type { University } from '../../../lib/types';

interface UniCardProps {
    uni: University;
    isShortlisted: boolean;
    onShortlist: (id: string, category: 'Dream' | 'Target' | 'Safe') => void;
    onRemove: (id: string) => void;
    showEvaluation?: boolean;
    // New props for locking functionality
    isLocked?: boolean;
    onLock?: (id: string) => void;
    onUnlock?: (id: string) => void;
    // For shortlist item ID mapping
    shortlistId?: string;
}

export const UniCard = ({
    uni,
    isShortlisted,
    onShortlist,
    onRemove,
    showEvaluation = false,
    isLocked = false,
    onLock,
    onUnlock,
    shortlistId
}: UniCardProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [expanded, setExpanded] = useState(false);

    // Dialog State
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'lock' | 'unlock' | null>(null);

    const open = Boolean(anchorEl);

    // AI Classification
    const aiCategory = uni.ai_classification || 'Target';

    // Determine badge color based on category
    const getBadgeColor = (cat: string) => {
        if (cat === 'Dream') return { bg: '#fee2e2', color: '#dc2626' };
        if (cat === 'Safe') return { bg: '#dcfce7', color: '#16a34a' };
        return { bg: '#eff6ff', color: '#2563eb' };
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

    // Dialog Handlers
    const handleLockClick = () => {
        setDialogAction('lock');
        setConfirmDialogOpen(true);
    };

    const handleUnlockClick = () => {
        setDialogAction('unlock');
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = () => {
        if (dialogAction === 'lock' && onLock && shortlistId) {
            onLock(shortlistId);
        } else if (dialogAction === 'unlock' && onUnlock && shortlistId) {
            onUnlock(shortlistId);
        }
        setConfirmDialogOpen(false);
    };

    return (
        <>
            <Card sx={{
                borderRadius: 4,
                boxShadow: isLocked
                    ? '0 0 0 2px #bbf7d0, 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                border: isLocked ? 'none' : '1px solid #f1f5f9',
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
                    zIndex: 10
                }
            }}>
                {isLocked && (
                    <Box sx={{
                        position: 'absolute', top: 12, right: 12, zIndex: 20,
                        bgcolor: '#dcfce7', color: '#16a34a', borderRadius: '50%', p: 0.5
                    }}>
                        <LockIcon size={20} />
                    </Box>
                )}

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

                    {/* Evaluation Section */}
                    {(showEvaluation || expanded) && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                                <Idea01Icon size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
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
                                <AlertCircleIcon size={16} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
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

                    {/* Lock Button Section (Integrated into Match Score area) */}
                    {onLock && onUnlock && shortlistId && (
                        <Box sx={{ mb: 2, p: 1, border: '1px dashed #cbd5e1', borderRadius: 2, display: 'flex', justifyContent: 'center' }}>
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
        </>
    );
};
