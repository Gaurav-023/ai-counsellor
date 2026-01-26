import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Grid,
    Stack,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { motion, type Variants } from 'framer-motion';

// Animation variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const staggerContainer: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2
        }
    }
};

const HeroSection = () => {
    const theme = useTheme();

    return (
        <Box
            component="section"
            sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: '100vh',
                pt: 10,
                background: `radial-gradient(circle at 50% 30%, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${theme.palette.background.default} 60%)`,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center" justifyContent="center">
                    <Grid item xs={12} md={10} lg={8} sx={{ textAlign: 'center' }}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.div variants={fadeInUp}>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 2,
                                        py: 0.5,
                                        borderRadius: 10,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        mb: 4,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: '#4ade80',
                                            boxShadow: '0 0 10px #4ade80',
                                        }}
                                    />
                                    <Typography variant="caption" fontWeight="bold" color="primary.main">
                                        Your Personal Study Abroad Guide
                                    </Typography>
                                </Box>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '4.5rem' }, lineHeight: 1.1, mb: 3, color: 'text.primary' }}>
                                    Plan your study-abroad <br />
                                    <Box component="span" sx={{ color: 'transparent', backgroundClip: 'text', backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}>
                                        journey with AI.
                                    </Box>
                                </Typography>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 5, maxWidth: '650px', mx: 'auto', lineHeight: 1.6 }}>
                                    Navigate universities, visas, and scholarships with personalized AI guidance.
                                    Start your dream education journey today without the confusion.
                                </Typography>
                            </motion.div>

                            <motion.div variants={fadeInUp}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        endIcon={<ArrowForward />}
                                        component={RouterLink}
                                        to="/signup"
                                        sx={{ fontSize: '1.1rem', py: 1.5, px: 4 }}
                                    >
                                        Start Free Counselling
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        component={RouterLink}
                                        to="/login"
                                        color="inherit"
                                        sx={{ fontSize: '1.1rem', py: 1.5, px: 4, borderColor: alpha(theme.palette.text.primary, 0.2), color: 'text.primary' }}
                                    >
                                        Log In
                                    </Button>
                                </Stack>
                            </motion.div>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default HeroSection;
