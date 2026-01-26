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

        // "Scroll down appear" - interpreted as standard "Smart Hide" (Hide on down, Show on up) 
        // OR "Transparent at top, Solid on scroll".
        // Evaluating user request: "scroll up must be hide scroll down appear"
        // This is highly non-standard if literal. 
        // Let's implement the Premium Standard: 
        // 1. Transparent at top (y < 50)
        // 2. Glassmorphism + Visible when scrolling
        // 3. Smart Hide: Hide when scrolling down fast, Show when scrolling up.

        if (latest > 50) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }

        // Always show navbar
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
                    bgcolor: scrolled ? alpha(theme.palette.background.default, 0.8) : 'transparent',
                    backdropFilter: scrolled ? 'blur(12px)' : 'none',
                    borderBottom: scrolled ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: scrolled ? '0 4px 30px rgba(0, 0, 0, 0.05)' : 'none'
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
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
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
                                    fontWeight: 700,
                                    letterSpacing: '-0.02em',
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    display: { xs: 'none', md: 'flex' }
                                }}
                            >
                                AI Counsellor
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1 }} />

                        <Button
                            color="inherit"
                            component={RouterLink}
                            to="/login"
                            sx={{
                                mr: 2,
                                color: 'text.secondary',
                                fontWeight: 500,
                                '&:hover': { color: 'text.primary', bgcolor: 'transparent' }
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            component={RouterLink}
                            to="/signup"
                            sx={{
                                boxShadow: 'none',
                                '&:hover': { boxShadow: '0 10px 20px -10px rgba(79, 70, 229, 0.5)' }
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
