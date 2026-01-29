import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Divider, IconButton, useTheme, useMediaQuery, AppBar, Toolbar, Avatar, Typography } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home01Icon, UniversityIcon, BookOpen01Icon, UserIcon, Settings01Icon, Logout01Icon, Menu01Icon, File01Icon } from 'hugeicons-react';
import { supabase } from '../lib/supabase';
import { AIChat } from '../components/ai/AIChat';

const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 80;



const DashboardLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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
        { text: 'Dashboard', icon: <Home01Icon size={24} />, path: '/dashboard' },
        { text: 'Universities', icon: <UniversityIcon size={24} />, path: '/universities' },
        { text: 'Shortlist', icon: <BookOpen01Icon size={24} />, path: '/shortlist' },
        { text: 'Applications', icon: <File01Icon size={24} />, path: '/application' },
        { text: 'Your Profile', icon: <UserIcon size={24} />, path: '/profile' },
        { text: 'Settings', icon: <Settings01Icon size={24} />, path: '/settings' },
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
            {/* Logo Area */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                <img src="https://picsum.photos/48" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                {!isCollapsed && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>AI Counsellor</span>
                    </Box>
                )}
            </Box>

            {!isMobile && (
                <Box sx={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end', px: 2, mb: 1 }}>
                    <IconButton onClick={handleCollapseToggle} size="small">
                        <Menu01Icon size={20} />
                    </IconButton>
                </Box>
            )}

            {/* Menu Items */}
            <List sx={{ px: 2, pt: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{
                                    borderRadius: 3,
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    px: isCollapsed ? 1 : 2,
                                    bgcolor: isActive ? '#eff6ff' : 'transparent',
                                    color: isActive ? '#3b82f6' : '#64748b',
                                    '&:hover': { bgcolor: '#f1f5f9', color: '#1e293b' }
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: isCollapsed ? 0 : 40, justifyContent: 'center' }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!isCollapsed && (
                                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Logout Button */}
            <Box sx={{ mt: 'auto', p: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Button
                    fullWidth
                    variant="text"
                    onClick={handleLogout}
                    sx={{
                        color: '#64748b',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        minWidth: 0,
                        px: isCollapsed ? 1 : 2,
                        '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' }
                    }}
                >
                    <Logout01Icon size={24} />
                    {!isCollapsed && <span style={{ marginLeft: 12 }}>Log Out</span>}
                </Button>
            </Box>
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
                            borderRight: '1px solid #e2e8f0',
                            transition: 'width 0.3s',
                            overflowX: 'hidden'
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${currentDrawerWidth}px)` }, transition: 'width 0.3s', display: 'flex', flexDirection: 'column' }}>
                {isMobile && (
                    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                        <Toolbar>
                            <IconButton onClick={handleDrawerToggle} edge="start" color="inherit" sx={{ mr: 2 }}>
                                <Menu01Icon />
                            </IconButton>
                            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                                AI Counsellor
                            </Typography>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5', fontSize: '0.9rem' }}>U</Avatar>
                        </Toolbar>
                    </AppBar>
                )}

                <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
                    <Outlet />
                </Box>
            </Box>

            {/* AI Floating Chat Widget */}
            <AIChat />
        </Box>
    );
};

export default DashboardLayout;
