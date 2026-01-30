import { Box, Typography, Grid, Paper, Avatar, Container } from '@mui/material';
import {
    Message01Icon,
    Search01Icon,
    Share01Icon,
    FavouriteIcon,
    SparklesIcon,
    Tick02Icon
} from 'hugeicons-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ item, index }: { item: any; index: number }) => (
    <Grid item xs={12} sm={6}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
        >
            <Paper
                elevation={0}
                component={motion.div}
                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 4,
                    bgcolor: 'transparent',
                    border: '1px solid transparent',
                    '&:hover': {
                        bgcolor: 'white',
                        borderColor: '#E2E8F0'
                    },
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Avatar variant="rounded" sx={{
                        bgcolor: item.bg,
                        color: item.color,
                        width: 48,
                        height: 48,
                        borderRadius: 3
                    }}>
                        {item.icon}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="700" color="#1E293B" sx={{ mb: 0.5, fontSize: '1.1rem' }}>
                            {item.title}
                        </Typography>
                        <Typography variant="body2" color="#64748B" sx={{ lineHeight: 1.6 }}>
                            {item.desc}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </motion.div>
    </Grid>
);

const AICounselorSection = () => {
    return (
        <Box sx={{ py: 12, bgcolor: '#FFFFFF', overflow: 'hidden' }}>
            <Container maxWidth="lg">
                <Grid container spacing={8} alignItems="center">

                    {/* Left Column: Text Content */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 6 }}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                            >
                                <Box sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    py: 0.8,
                                    borderRadius: 100,
                                    bgcolor: '#F0F9FF',
                                    border: '1px solid #E0F2FE',
                                    mb: 3
                                }}>
                                    <SparklesIcon size={14} color="#0EA5E9" />
                                    <Typography variant="caption" fontWeight="700" color="#0EA5E9" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        AI-Powered Guidance
                                    </Typography>
                                </Box>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Typography variant="h3" fontWeight="800" color="#0F172A" sx={{ mb: 2, letterSpacing: '-1px', lineHeight: 1.1 }}>
                                    Meet your personal<br />
                                    <span style={{ color: '#4F46E5' }}>AI study abroad expert</span>
                                </Typography>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                <Typography variant="body1" color="#64748B" sx={{ fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 480 }}>
                                    Forget generic advice. Get instant, personalized roadmap planning based on your unique profile, available 24/7.
                                </Typography>
                            </motion.div>
                        </Box>

                        <Grid container spacing={2}>
                            {[
                                {
                                    icon: <Message01Icon size={24} />,
                                    title: "Real-time Chat",
                                    desc: "Discuss your goals and get instant answers to complex admission queries.",
                                    color: "#4F46E5",
                                    bg: "#EEF2FF"
                                },
                                {
                                    icon: <Search01Icon size={24} />,
                                    title: "Profile Analysis",
                                    desc: "Deep analysis of your grades and interests to match perfect universities.",
                                    color: "#0EA5E9",
                                    bg: "#F0F9FF"
                                },
                                {
                                    icon: <Share01Icon size={24} />,
                                    title: "Document Review",
                                    desc: "Get feedback on your SOPs and essays to improve acceptance chances.",
                                    color: "#8B5CF6",
                                    bg: "#F5F3FF"
                                },
                                {
                                    icon: <FavouriteIcon size={24} />,
                                    title: "Personalized Care",
                                    desc: "An empathetic guide that understands your anxieties and dreams.",
                                    color: "#EC4899",
                                    bg: "#FDF2F8"
                                }
                            ].map((item, index) => (
                                <FeatureCard key={index} item={item} index={index} />
                            ))}
                        </Grid>
                    </Grid>

                    {/* Right Column: Visual Mockup */}
                    <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            {/* Blob Background */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            >
                                <Box sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '120%',
                                    height: '120%',
                                    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
                                    zIndex: 0,
                                    pointerEvents: 'none'
                                }} />
                            </motion.div>

                            {/* Main Chat Interface Card */}
                            <Paper
                                component={motion.div}
                                whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                elevation={0}
                                sx={{
                                    position: 'relative',
                                    zIndex: 1,
                                    borderRadius: 4,
                                    border: '1px solid #E2E8F0',
                                    overflow: 'hidden',
                                    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.1)',
                                    bgcolor: '#FAFAFA',
                                    transformStyle: 'preserve-3d',
                                    perspective: 1000
                                }}
                            >
                                {/* Fake Browser Header */}
                                <Box sx={{ borderBottom: '1px solid #E2E8F0', bgcolor: 'white', p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                                    </Box>
                                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                                        <Box sx={{
                                            display: 'inline-flex', alignItems: 'center', gap: 1,
                                            bgcolor: '#F1F5F9', px: 2, py: 0.5, borderRadius: 6,
                                            width: '60%', mx: 'auto'
                                        }}>
                                            <Box sx={{ width: 12, height: 12, bgcolor: '#CBD5E1', borderRadius: '50%' }} />
                                            <Box sx={{ height: 4, width: '60%', bgcolor: '#E2E8F0', borderRadius: 2 }} />
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Chat Content */}
                                <Box sx={{ p: 4 }}>
                                    <Typography variant="subtitle2" color="#94A3B8" sx={{ mb: 3, textAlign: 'center', fontSize: '0.8rem' }}>
                                        Today, 10:23 AM
                                    </Typography>

                                    {/* User Message */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            viewport={{ once: true }}
                                        >
                                            <Paper elevation={0} sx={{
                                                bgcolor: '#4F46E5', color: 'white',
                                                p: 2, borderRadius: '20px 20px 4px 20px',
                                                maxWidth: '100%', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                                            }}>
                                                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                                    Which universities in Germany are best for Fine Arts? 🎨
                                                </Typography>
                                            </Paper>
                                        </motion.div>
                                    </Box>

                                    {/* AI Message */}
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            transition={{ delay: 0.5, type: "spring" }}
                                            viewport={{ once: true }}
                                        >
                                            <Avatar sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', border: '1px solid #E0E7FF' }}>
                                                <SparklesIcon size={20} />
                                            </Avatar>
                                        </motion.div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            viewport={{ once: true }}
                                            style={{ flex: 1 }}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <Paper elevation={0} sx={{
                                                    bgcolor: 'white', p: 2.5, borderRadius: '4px 20px 20px 20px',
                                                    border: '1px solid #E2E8F0', mb: 2
                                                }}>
                                                    <Typography variant="body2" color="#334155" sx={{ mb: 2 }}>
                                                        Based on your profile, here are the top choices:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.8 }}
                                                            viewport={{ once: true }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                                                                <Box sx={{ width: 32, height: 32, bgcolor: '#E2E8F0', borderRadius: 1 }} />
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="subtitle2" color="#1E293B">Berlin University of Arts</Typography>
                                                                    <Typography variant="caption" color="#64748B">World-class fine arts program</Typography>
                                                                </Box>
                                                                <Tick02Icon size={16} color="#10B981" />
                                                            </Box>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            whileInView={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 1.0 }}
                                                            viewport={{ once: true }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                                                                <Box sx={{ width: 32, height: 32, bgcolor: '#E2E8F0', borderRadius: 1 }} />
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="subtitle2" color="#1E293B">Bauhaus-Universität Weimar</Typography>
                                                                    <Typography variant="caption" color="#64748B">Focus on design & media</Typography>
                                                                </Box>
                                                            </Box>
                                                        </motion.div>
                                                    </Box>
                                                </Paper>
                                                <Typography variant="caption" color="#94A3B8" sx={{ ml: 1 }}>
                                                    AI Counselor • Just now
                                                </Typography>
                                            </Box>
                                        </motion.div>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Floating Element 1 - Notification */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                viewport={{ once: true }}
                            >
                                <Paper
                                    component={motion.div}
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    elevation={4}
                                    sx={{
                                        position: 'absolute', top: '15%', right: -20,
                                        p: 1.5, borderRadius: 3, bgcolor: 'white',
                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                        zIndex: 2
                                    }}
                                >
                                    <Box sx={{ width: 8, height: 8, bgcolor: '#10B981', borderRadius: '50%' }} />
                                    <Typography variant="caption" fontWeight="bold" color="#334155">
                                        Profile Match: 98%
                                    </Typography>
                                </Paper>
                            </motion.div>

                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AICounselorSection;
