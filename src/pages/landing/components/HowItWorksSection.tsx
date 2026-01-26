import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    alpha,
    useTheme,
    Paper
} from '@mui/material';
import {
    UserAdd01Icon,
    Search01Icon,
    AiBrain03Icon,
    CheckmarkCircle02Icon,
    ArrowDown01Icon
} from 'hugeicons-react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useRef } from 'react';

const cardVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 260, damping: 20 }
    }
};

const lineVariants: Variants = {
    hidden: { height: 0 },
    visible: {
        height: '100%',
        transition: { duration: 0.8, ease: "easeInOut" }
    }
};

const HowItWorksSection = () => {
    const theme = useTheme();

    const steps = [
        {
            label: 'Create Account',
            desc: "Sign up in seconds to start your personalized journey.",
            icon: UserAdd01Icon
        },
        {
            label: 'Set Preferences',
            desc: "Tell us about your dream course, country, and budget.",
            icon: Search01Icon
        },
        {
            label: 'Get AI Plan',
            desc: "Our AI generates a step-by-step roadmap just for you.",
            icon: AiBrain03Icon
        },
        {
            label: 'Apply & Fly',
            desc: "Follow the plan, apply to universities, and get your visa!",
            icon: CheckmarkCircle02Icon
        }
    ];

    return (
        <Box sx={{ py: 15, bgcolor: '#ffffff', position: 'relative', overflow: 'hidden' }}>
            <Container maxWidth="md">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography variant="h3" align="center" fontWeight="bold" gutterBottom color="text.primary">
                        How it works
                    </Typography>
                    <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 10 }}>
                        Your journey to a dream university in 4 simple steps.
                    </Typography>
                </motion.div>

                <Box sx={{ position: 'relative', pl: { xs: 2, md: 0 } }}>

                    {steps.map((step, index) => (
                        <Box key={step.label} sx={{ position: 'relative', mb: 8, display: 'flex', gap: 4 }}>

                            {/* Connector Line (except for last item) */}
                            {index !== steps.length - 1 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 28,
                                        top: 60,
                                        bottom: -40,
                                        width: 4,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        borderRadius: 2,
                                        zIndex: 0
                                    }}
                                >
                                    <motion.div
                                        variants={lineVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: "-100px" }}
                                        style={{
                                            width: '100%',
                                            background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            borderRadius: 2
                                        }}
                                    />
                                </Box>
                            )}

                            {/* Icon Circle */}
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <motion.div
                                    variants={iconVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                >
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, #ffffff 100%)`,
                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 10px 30px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
                                            color: 'primary.main'
                                        }}
                                    >
                                        <step.icon size={28} variant="Solid" />
                                    </Box>
                                </motion.div>
                            </Box>

                            {/* Content Card */}
                            <motion.div
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                style={{ flex: 1 }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                                        bgcolor: 'background.paper',
                                        position: 'relative',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                            boxShadow: `0 20px 40px -10px ${alpha(theme.palette.divider, 0.5)}`
                                        },
                                        // Arrow pointing to left
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: -10,
                                            top: 24,
                                            width: 20,
                                            height: 20,
                                            bgcolor: 'background.paper',
                                            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                                            transform: 'rotate(45deg)',
                                            borderRadius: '0 0 0 4px'
                                        }
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                                        {step.label}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {step.desc}
                                    </Typography>
                                </Paper>
                            </motion.div>
                        </Box>
                    ))}

                    {/* Final Arrow pointing down */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 2.2, mt: -4 }}>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 }}
                        >
                            <ArrowDown01Icon size={24} color={theme.palette.primary.main} />
                        </motion.div>
                    </Box>

                </Box>

                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            component={RouterLink}
                            to="/signup"
                            sx={{ borderRadius: 10, px: 5, py: 1.5, borderWidth: 2 }}
                        >
                            Start Your Journey Now
                        </Button>
                    </motion.div>
                </Box>
            </Container>
        </Box>
    );
};

export default HowItWorksSection;
