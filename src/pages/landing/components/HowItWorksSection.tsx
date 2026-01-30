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
} from 'hugeicons-react';
import { motion, type Variants } from 'framer-motion';


const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
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
        <Box sx={{ py: 15, bgcolor: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
            <Container maxWidth="md">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6 }}
                >
                    <Typography variant="h3" align="center" fontWeight="800" gutterBottom sx={{ color: '#0F172A', letterSpacing: '-0.02em', mb: 2 }}>
                        How it works
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ color: '#64748B', mb: 10, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
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
                                        width: 2,
                                        bgcolor: '#E2E8F0', // Light Gray Line
                                        zIndex: 0
                                    }}
                                >
                                    <motion.div
                                        variants={lineVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: false }}
                                        style={{
                                            width: '100%',
                                            background: '#3B82F6', // Blue fill
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
                                    viewport={{ once: false }}
                                >
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: '50%',
                                            bgcolor: 'white',
                                            border: '1px solid #E2E8F0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                            color: '#2563EB' // Blue Icon
                                        }}
                                    >
                                        <step.icon size={28} />
                                    </Box>
                                </motion.div>
                            </Box>

                            {/* Content Card */}
                            <motion.div
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.3 }}
                                style={{ flex: 1 }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        border: '1px solid #E2E8F0',
                                        bgcolor: 'white',
                                        position: 'relative',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            borderColor: '#CBD5E1',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                                        },
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#0F172A' }}>
                                        {step.label}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#64748B' }}>
                                        {step.desc}
                                    </Typography>
                                </Paper>
                            </motion.div>
                        </Box>
                    ))}

                </Box>

                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false }}
                    >
                        <Button
                            variant="outlined"
                            size="large"
                            component={RouterLink}
                            to="/signup"
                            sx={{
                                borderRadius: 50, px: 5, py: 1.5, borderWidth: 1,
                                color: '#0F172A', borderColor: '#E2E8F0',
                                '&:hover': { borderColor: '#0F172A', bgcolor: 'transparent' }
                            }}
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
