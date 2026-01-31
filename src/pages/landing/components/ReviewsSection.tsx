import { Avatar, Box, Container, Paper, Typography, Rating, Grid, alpha } from '@mui/material';
import { motion, type Variants } from 'framer-motion';
import { QuoteUpIcon } from 'hugeicons-react';

const reviews = [
    {
        id: 1,
        name: "Sarah Jenkins",
        role: "Computer Science Student",
        content: "This AI counselor completely changed my application strategy. I found universities I hadn't even considered! The roadmap was clearer than anything my school counselor provided.",
        rating: 5,
        initial: "S",
        color: "linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)",
        university: "Stanford University"
    },
    {
        id: 2,
        name: "David Chen",
        role: "Prospective MBA",
        content: "I was overwhelmed by the visa process, but the step-by-step guidance broke it down perfectly. It felt like having a personal expert available 24/7.",
        rating: 5,
        initial: "D",
        color: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
        university: "INSEAD"
    },
    {
        id: 3,
        name: "Priya Patel",
        role: "Data Science Applicant",
        content: "The feedback on my profile was honest and actionable. It helped me improve my weak spots before applying. Highly recommended for anyone serious about studying abroad.",
        rating: 5,
        initial: "P",
        color: "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
        university: "Imperial College London"
    }
];

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const ReviewsSection = () => {
    return (
        <Box sx={{
            py: 16,
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)'
        }}>

            {/* Decorative Background Elements */}
            <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.3,
                zIndex: 0
            }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 12 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <Box sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            bgcolor: alpha('#3B82F6', 0.1),
                            color: '#2563EB',
                            borderRadius: '20px',
                            mb: 2,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}>
                            WALL OF LOVE
                        </Box>
                        <Typography
                            variant="h2"
                            component="h2"
                            fontWeight="800"
                            gutterBottom
                            sx={{
                                color: '#0F172A',
                                letterSpacing: '-0.02em',
                                fontSize: { xs: '2.5rem', md: '3.5rem' }
                            }}
                        >
                            Trusted by <Box component="span" sx={{ color: '#2563EB' }}>Ambitious</Box> Students
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{ color: '#64748B', maxWidth: 660, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}
                        >
                            Join thousands who have already secured admissions to their dream universities with the help of our AI counselor.
                        </Typography>
                    </motion.div>
                </Box>

                <Grid container spacing={4}>
                    {reviews.map((review, index) => (
                        <Grid item xs={12} md={4} key={review.id}>
                            <motion.div
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                style={{ height: '100%' }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        borderRadius: 6,
                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.6)',
                                        position: 'relative',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                            bgcolor: 'white',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                            '& .quote-icon': {
                                                opacity: 1,
                                                transform: 'scale(1.1) rotate(-10deg)',
                                                color: alpha(review.color.includes('FA') ? '#3B82F6' : '#10B981', 0.2)
                                            }
                                        }
                                    }}
                                >
                                    {/* Decorative Quote Icon */}
                                    <Box
                                        className="quote-icon"
                                        sx={{
                                            position: 'absolute',
                                            top: 24,
                                            right: 24,
                                            color: '#E2E8F0',
                                            transition: 'all 0.4s ease',
                                            opacity: 0.5
                                        }}
                                    >
                                        <QuoteUpIcon size={48} />
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <Box sx={{ display: 'flex', gap: 0.5, mb: 3 }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Rating
                                                    key={i}
                                                    max={1}
                                                    value={i < review.rating ? 1 : 0}
                                                    readOnly
                                                    icon={<Box component="span" sx={{ color: '#F59E0B', fontSize: '1.2rem' }}>★</Box>}
                                                    emptyIcon={<Box component="span" sx={{ color: '#E2E8F0', fontSize: '1.2rem' }}>★</Box>}
                                                    sx={{ mr: -0.5 }}
                                                />
                                            ))}
                                        </Box>

                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#334155',
                                                mb: 4,
                                                flex: 1,
                                                lineHeight: 1.7,
                                                fontSize: '1.05rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            {review.content}
                                        </Typography>

                                        <Box sx={{ borderTop: '1px solid #F1F5F9', pt: 3, mt: 'auto' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        background: review.color,
                                                        width: 50,
                                                        height: 50,
                                                        fontSize: '1.2rem',
                                                        fontWeight: 700,
                                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    {review.initial}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0F172A', lineHeight: 1.2 }}>
                                                        {review.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                                                        {review.role}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
                                                        Accepted to {review.university}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default ReviewsSection;
