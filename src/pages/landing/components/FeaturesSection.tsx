import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import {
    GlobalEducationIcon,
    AiChat02Icon,
    Task01Icon
} from 'hugeicons-react';
import { motion, type Variants } from 'framer-motion';

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const FeaturesSection = () => {
    const theme = useTheme();

    const features = [
        { icon: GlobalEducationIcon, title: "Global Database", desc: "Access real-time data on 50,000+ universities across 30+ countries." },
        { icon: AiChat02Icon, title: "24/7 AI Support", desc: "Get instant, accurate answers to your visa and application queries anytime." },
        { icon: Task01Icon, title: "Personalized Plans", desc: "Receive a tailored step-by-step roadmap based on your profile and goals." }
    ];

    return (
        <Box sx={{ py: 15, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Container maxWidth="lg">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, margin: "-100px", amount: 0.3 }}
                    variants={fadeInUp}
                >
                    <Typography variant="h3" align="center" fontWeight="bold" gutterBottom color="text.primary">
                        Why choose AI Counsellor?
                    </Typography>
                    <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 10, maxWidth: 600, mx: 'auto' }}>
                        We simplify the complex process of studying abroad using advanced AI agents.
                    </Typography>
                </motion.div>

                <Grid container spacing={4}>
                    {features.map((feature, idx) => (
                        <Grid item xs={12} md={4} key={idx}>
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: false, amount: 0.3 }}
                                variants={fadeInUp}
                                style={{ height: '100%' }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 5,
                                        height: '100%',
                                        borderRadius: 6,
                                        bgcolor: '#ffffff',
                                        border: '1px solid',
                                        borderColor: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 24px -6px rgba(0,0,0,0.05)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-12px)',
                                            borderColor: alpha(theme.palette.primary.main, 0.1),
                                            boxShadow: `0 20px 40px -10px ${alpha(theme.palette.primary.main, 0.15)}`
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            mb: 4,
                                            p: 2.5,
                                            borderRadius: '50%', // Circle shape for icon container
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 80,
                                            height: 80
                                        }}
                                    >
                                        <feature.icon size={40} className="w-10 h-10" />
                                    </Box>
                                    <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary" sx={{ mb: 2 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                        {feature.desc}
                                    </Typography>
                                </Paper>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default FeaturesSection;
