import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery, Avatar, Typography, Menu, MenuItem, Divider } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home01Icon, UniversityIcon, BookOpen01Icon, UserIcon, Settings01Icon, Logout01Icon, Menu01Icon, File01Icon, HelpCircleIcon, ArrowLeft01Icon, ArrowRight01Icon, BubbleChatIcon } from 'hugeicons-react';
import { supabase } from '../lib/supabase';
import { AIChat } from '../components/ai/AIChat';

const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 80;

const DashboardLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Profile Menu State
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = async () => {
        handleCloseUserMenu();
        await supabase.auth.signOut();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Home01Icon size={24} />, path: '/dashboard' },
        { text: 'AI Counselor', icon: <BubbleChatIcon size={24} />, path: '/counselor' },
        { text: 'Universities', icon: <UniversityIcon size={24} />, path: '/universities' },
        { text: 'Shortlist', icon: <BookOpen01Icon size={24} />, path: '/shortlist' },
        { text: 'Applications', icon: <File01Icon size={24} />, path: '/application' },
        { text: 'Your Profile', icon: <UserIcon size={24} />, path: '/profile' },
        { text: 'Settings', icon: <Settings01Icon size={24} />, path: '/settings' },
    ];

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white', // White Background (Requested)
            color: '#1e293b', // Black/Slate Text
            borderRight: '1px solid #e2e8f0'
        }}>
            {/* Logo Area */}
            <Box sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <img src="https://picsum.photos/48" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                {!isCollapsed && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a' }}>
                            AI Counsellor
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Menu Items */}
            <List sx={{ px: 2, pt: 3, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    px: isCollapsed ? 1 : 2,
                                    py: 1.5,
                                    bgcolor: isActive ? '#f1f5f9' : 'transparent',
                                    color: isActive ? '#0f172a' : '#64748b',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: '#f8fafc',
                                        color: '#0f172a'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: isActive ? '#0f172a' : 'inherit',
                                    minWidth: isCollapsed ? 0 : 40,
                                    justifyContent: 'center'
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!isCollapsed && (
                                    <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? 700 : 500,
                                            letterSpacing: '0.2px'
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    const currentDrawerWidth = isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Desktop Sidebar */}
            <Box component="nav" sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.3s' }}>
                <Drawer
                    variant={isMobile ? "temporary" : "permanent"}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: isMobile ? DRAWER_WIDTH : currentDrawerWidth,
                            borderRight: 'none',
                            transition: 'width 0.3s',
                            overflowX: 'hidden',
                            bgcolor: 'white'
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
                transition: 'width 0.3s',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden'
            }}>
                {/* --- TOP HEADER (Desktop & Mobile) --- */}
                <Box sx={{
                    px: { xs: 2, md: 4 },
                    py: 2,
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e2e8f0',
                    zIndex: 10
                }}>
                    {/* Left: Collapse Toggle + Page Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isMobile ? (
                            <IconButton onClick={handleDrawerToggle} edge="start" sx={{ color: '#1e293b' }}>
                                <Menu01Icon />
                            </IconButton>
                        ) : (
                            <IconButton
                                onClick={handleCollapseToggle}
                                size="small"
                                sx={{ color: '#64748b', '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' } }}
                            >
                                {isCollapsed ? <ArrowRight01Icon size={20} /> : <ArrowLeft01Icon size={20} />}
                            </IconButton>
                        )}

                        <Typography variant="h5" fontWeight="800" color="#1e293b" sx={{ letterSpacing: '-0.5px' }}>
                            {menuItems.find(i => i.path === location.pathname)?.text || 'Dashboard'}
                        </Typography>
                    </Box>

                    {/* Right: Help Icon + Profile Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Help Icon (Kept as "1 icon more") */}
                        <IconButton sx={{ color: '#64748b', '&:hover': { color: '#16a34a', bgcolor: '#dcfce7' } }}>
                            <HelpCircleIcon size={22} />
                        </IconButton>

                        <Box sx={{ ml: 1 }}>
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#0f172a', color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>GA</Avatar>
                            </IconButton>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                                PaperProps={{
                                    sx: { width: 200, borderRadius: 3, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
                                }}
                            >
                                <Box sx={{ px: 2, py: 1.5 }}>
                                    <Typography variant="subtitle2" fontWeight="700">User Profile</Typography>
                                    <Typography variant="caption" color="text.secondary">Student Account</Typography>
                                </Box>
                                <Divider />
                                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }} sx={{ py: 1.5 }}>
                                    <UserIcon size={18} style={{ marginRight: 12 }} /> Profile
                                </MenuItem>
                                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }} sx={{ py: 1.5 }}>
                                    <Settings01Icon size={18} style={{ marginRight: 12 }} /> Settings
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#ef4444', fontWeight: 600 }}>
                                    <Logout01Icon size={18} style={{ marginRight: 12 }} /> Log Out
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Box>

                {/* Page Content Scrollable Area */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, md: 4 } }}>
                    <Outlet />
                </Box>
            </Box>

            {/* AI Floating Chat Widget */}
            <AIChat />
        </Box>
    );
};

export default DashboardLayout;
