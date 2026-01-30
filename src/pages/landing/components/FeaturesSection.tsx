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
    hidden: { opacity: 0, y: 40 },
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
        <Box sx={{ py: 15, bgcolor: '#F8FAFC' }}> {/* Very Light Gray Background */}
            <Container maxWidth="lg">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, margin: "-100px", amount: 0.3 }}
                    variants={fadeInUp}
                >
                    <Typography variant="h3" align="center" fontWeight="800" gutterBottom sx={{ color: '#0F172A', letterSpacing: '-0.02em', mb: 2 }}>
                        Why choose AI Counsellor?
                    </Typography>
                    <Typography variant="h6" align="center" sx={{ color: '#64748B', mb: 10, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
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
                                        bgcolor: '#FFFFFF',
                                        border: '1px solid #E2E8F0', // Light border
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            borderColor: '#3B82F6', // Blue Border on hover
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            mb: 4,
                                            p: 2.5,
                                            borderRadius: 4,
                                            bgcolor: '#EFF6FF', // Light Blue bg
                                            color: '#2563EB', // Blue icon
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 72,
                                            height: 72
                                        }}
                                    >
                                        <feature.icon size={32} />
                                    </Box>
                                    <Typography variant="h5" fontWeight="700" gutterBottom sx={{ color: '#0F172A', mb: 2 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#64748B', lineHeight: 1.6 }}>
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
