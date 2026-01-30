
import { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery, Avatar, Typography, Tooltip } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home01Icon, BookOpen01Icon, UserIcon, Settings01Icon, Logout01Icon, Menu01Icon, File01Icon, ArrowLeft01Icon, ArrowRight01Icon, BotIcon, Building06Icon, AiChat02Icon } from 'hugeicons-react';
import { supabase } from '../lib/supabase';
import { getStudentProfile } from '../lib/api';
import { AIChat } from '../components/ai/AIChat';

const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 80;

const DashboardLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userName, setUserName] = useState<string>('Student');
    const [userInitials, setUserInitials] = useState<string>('ST');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const profile = await getStudentProfile();
            if (profile && profile.full_name) {
                setUserName(profile.full_name);
                const initials = profile.full_name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                setUserInitials(initials);
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Home01Icon size={22} />, path: '/dashboard' },
        { text: 'AI Counselor', icon: <AiChat02Icon size={22} />, path: '/counselor' },
        { text: 'Universities', icon: <Building06Icon size={22} />, path: '/universities' },
        { text: 'Shortlist', icon: <BookOpen01Icon size={22} />, path: '/shortlist' },
        { text: 'Applications', icon: <File01Icon size={22} />, path: '/application' },
        { text: 'Your Profile', icon: <UserIcon size={22} />, path: '/profile' },
        { text: 'Settings', icon: <Settings01Icon size={22} />, path: '/settings' },
    ];

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px)',
            color: '#1e293b',
            borderRight: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: 'inset -20px 0 30px -30px rgba(0,0,0,0.05)'
        }}>
            {/* Logo Area & Toggle */}
            <Box sx={{
                p: 3, pt: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between', // Space between logo and toggle
                mb: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 40, height: 40,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.3)'
                    }}>
                        <BotIcon size={22} />
                    </Box>

                    {!isCollapsed && (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', color: '#111827', fontSize: '1.1rem' }}>
                                AI Counselor
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, mt: 0.5, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Guidance
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Desktop Collapse Toggle (Inside Sidebar now) */}
                {!isMobile && !isCollapsed && (
                    <IconButton
                        onClick={handleCollapseToggle}
                        size="small"
                        sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A', bgcolor: 'rgba(0,0,0,0.05)' } }}
                    >
                        <ArrowLeft01Icon size={20} />
                    </IconButton>
                )}
            </Box>

            {/* Menu Items */}
            <List sx={{ px: 2, pt: 1, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 3,
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    px: isCollapsed ? 1 : 2.5,
                                    py: 1.5,
                                    bgcolor: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
                                    color: isActive ? '#2563EB' : '#64748b',
                                    boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)' : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        bgcolor: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                                        color: isActive ? '#1E40AF' : '#1e293b',
                                        transform: 'translateX(4px)'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: 'inherit',
                                    minWidth: isCollapsed ? 0 : 40,
                                    justifyContent: 'center',
                                    '& svg': { transition: 'transform 0.2s' },
                                    '.MuiListItemButton-root:hover & svg': { transform: 'scale(1.1)' }
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!isCollapsed && (
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '0.95rem',
                                            fontWeight: isActive ? 700 : 500,
                                            letterSpacing: '0.1px'
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* User Profile Footer */}
            {(!isCollapsed || isMobile) && (
                <Box sx={{ p: 2, m: 2, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563EB', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 4px 6px -2px rgba(37, 99, 235, 0.3)' }}>
                            {userInitials}
                        </Avatar>
                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="subtitle2" fontWeight="700" noWrap color="#1e293b">{userName}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>Student Profile</Typography>
                        </Box>
                        <Tooltip title="Log Out">
                            <IconButton size="small" onClick={handleLogout} sx={{ ml: 'auto', color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                                <Logout01Icon size={16} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            )}

            {/* Collapsed Toggle (Footer option for collapsed state) */}
            {!isMobile && isCollapsed && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                    <IconButton onClick={handleCollapseToggle} sx={{ color: '#64748b' }}>
                        <ArrowRight01Icon size={20} />
                    </IconButton>
                </Box>
            )}
        </Box>
    );

    const currentDrawerWidth = isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;

    return (
        <Box sx={{
            display: 'flex', minHeight: '100vh',
            background: '#F8FAFC' // Neutral Off-White (No Blue Tint)
        }}>
            {/* Desktop Sidebar */}
            <Box component="nav" sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <Drawer
                    variant={isMobile ? "temporary" : "permanent"}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: isMobile ? DRAWER_WIDTH : currentDrawerWidth,
                            borderRight: 'none',
                            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflowX: 'hidden',
                            bgcolor: 'transparent',
                            boxShadow: 'none'
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{
                flexGrow: 1,
                width: { md: `calc(100% - ${currentDrawerWidth}px)` },
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                position: 'relative' // For absolute positioning if needed
            }}>

                {/* Mobile Menu Button - Floating Top Left */}
                {isMobile && (
                    <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1100 }}>
                        <IconButton
                            onClick={handleDrawerToggle}
                            sx={{
                                bgcolor: 'white', color: '#1e293b',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                '&:hover': { bgcolor: '#f8fafc' }
                            }}
                        >
                            <Menu01Icon size={24} />
                        </IconButton>
                    </Box>
                )}

                {/* Content Area - Full height, no top bar padding */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, pt: { xs: 8, md: 4 } }}>
                    {/* Added top padding on mobile only to avoid overlap with floating button */}
                    <Outlet />
                </Box>
            </Box>

            {/* AI Floating Chat Widget */}
            <AIChat />
        </Box>
    );
};

export default DashboardLayout;
