import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    alpha,
    useTheme
} from '@mui/material';
import { AiBrain03Icon } from 'hugeicons-react'; // SmartToy equivalent
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

const LandingNavbar = () => {
    const theme = useTheme();
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
        setHidden(false);
    });

    return (
        <motion.div
            variants={{
                visible: { y: 0 },
                hidden: { y: -100 },
            }}
            animate={hidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1100
            }}
        >
            <AppBar
                position="static"
                color="transparent"
                elevation={0}
                sx={{
                    bgcolor: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent', // White Glass
                    backdropFilter: scrolled ? 'blur(16px)' : 'none',
                    borderBottom: scrolled ? `1px solid ${alpha('#E2E8F0', 0.8)}` : 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.03)' : 'none'
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 80 } }}>

                        {/* Logo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 2 }}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: '12px',
                                    bgcolor: '#EFF6FF', // Light Blue
                                    color: '#2563EB', // Primary Blue
                                    display: 'flex'
                                }}
                            >
                                <AiBrain03Icon size={24} />
                            </Box>
                            <Typography
                                variant="h6"
                                noWrap
                                component="a"
                                href="/"
                                sx={{
                                    fontFamily: 'inherit',
                                    fontWeight: 800,
                                    letterSpacing: '-0.02em',
                                    color: '#0F172A', // Dark Slate
                                    textDecoration: 'none',
                                    display: { xs: 'none', md: 'flex' }
                                }}
                            >
                                AI Counsellor
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        <Button
                            component={RouterLink}
                            to="/login"
                            sx={{
                                mr: 2,
                                color: '#475569', // Slate 600
                                fontWeight: 600,
                                '&:hover': { color: '#0F172A', bgcolor: 'transparent' }
                            }}
                        >
                            Log in
                        </Button>
                        <Button
                            variant="contained"
                            component={RouterLink}
                            to="/signup"
                            sx={{
                                boxShadow: 'none',
                                bgcolor: '#0F172A',
                                color: 'white',
                                borderRadius: 50,
                                px: 3,
                                '&:hover': {
                                    bgcolor: '#1E293B',
                                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                                }
                            }}
                        >
                            Get Started
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>
        </motion.div>
    );
};

export default LandingNavbar;
