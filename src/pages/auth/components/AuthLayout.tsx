import { Box, Container, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowLeft01Icon } from 'hugeicons-react';
import { Link as RouterLink } from 'react-router-dom';

interface AuthLayoutProps {
    children: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const AuthLayout = ({ children, maxWidth = 'xs' }: AuthLayoutProps) => {

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Scenic purple mountain vibe background
                background: `
  linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.6)),
  url('/login-bg.webp')
`,


                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    // Overlay to ensure text readability and matching the purple aesthetic
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',
                    zIndex: 0
                }
            }}
        >
            <Box
                component={RouterLink}
                to="/"
                sx={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'white',
                    textDecoration: 'none',
                    opacity: 0.8,
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 1 }
                }}
            >
                <ArrowLeft01Icon size={24} />
                <Typography variant="subtitle2" fontWeight="medium">Back</Typography>
            </Box>

            <Container maxWidth={maxWidth} sx={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            borderRadius: 3,
                            // Glassmorphism effect
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                            color: 'white'
                        }}
                    >
                        {children}
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default AuthLayout;
