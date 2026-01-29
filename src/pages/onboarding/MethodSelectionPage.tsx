import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { File01Icon, BubbleChatIcon, ArrowRight01Icon, SparklesIcon } from 'hugeicons-react';
import AuthLayout from '../auth/components/AuthLayout';

const MethodSelectionPage = () => {
    const navigate = useNavigate();

    return (
        <AuthLayout maxWidth="md">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ color: 'white' }}>
                    Welcome!
                </Typography>
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                    How would you like to build your profile?
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* AI Counselor Option */}
                <Grid item xs={12} md={6}>
                    <Card
                        onClick={() => navigate('/onboarding-ai')}
                        sx={{
                            height: '100%',
                            minHeight: 300,
                            bgcolor: 'rgba(99, 102, 241, 0.1)', // Primary tint
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: 4,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                bgcolor: 'rgba(99, 102, 241, 0.2)',
                                borderColor: '#6366f1',
                                transform: 'translateY(-8px)',
                                boxShadow: '0 20px 40px rgba(99, 102, 241, 0.25)'
                            }
                        }}
                    >
                        <Box sx={{
                            position: 'absolute', top: -30, right: -30,
                            width: 120, height: 120, bgcolor: '#6366f1', filter: 'blur(50px)', opacity: 0.4
                        }} />

                        <CardContent sx={{
                            p: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            flexGrow: 1,
                            justifyContent: 'center'
                        }}>
                            <Box sx={{
                                p: 3,
                                borderRadius: '50%',
                                bgcolor: 'rgba(99, 102, 241, 0.2)',
                                color: '#818cf8',
                                mb: 3,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <BubbleChatIcon size={40} />
                            </Box>

                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <Typography variant="h5" fontWeight="bold" color="white">
                                    AI Counselor
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(236, 72, 153, 0.2)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                                    <SparklesIcon size={14} color="#f472b6" />
                                    <Typography variant="caption" fontWeight="bold" color="#f472b6" sx={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                                        Best
                                    </Typography>
                                </Box>
                            </Stack>

                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, lineHeight: 1.6 }}>
                                Chat with our AI to build your profile instantly. It feels just like talking to a human counselor.
                            </Typography>

                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: '#818cf8', fontWeight: 600 }}>
                                <Typography>Start Chat</Typography>
                                <ArrowRight01Icon size={20} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Manual Setup Option */}
                <Grid item xs={12} md={6}>
                    <Card
                        onClick={() => navigate('/onboarding')}
                        sx={{
                            height: '100%',
                            minHeight: 300,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 4,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.08)',
                                borderColor: 'white',
                                transform: 'translateY(-8px)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                            }
                        }}
                    >
                        <CardContent sx={{
                            p: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            flexGrow: 1,
                            justifyContent: 'center'
                        }}>
                            <Box sx={{
                                p: 3,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                color: '#94a3b8',
                                mb: 3,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <File01Icon size={40} />
                            </Box>

                            <Typography variant="h5" fontWeight="bold" color="white" gutterBottom sx={{ mb: 2 }}>
                                Manual Form
                            </Typography>

                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, lineHeight: 1.6 }}>
                                Fill out your details step-by-step yourself. Best if you have all your documents ready.
                            </Typography>

                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'white', fontWeight: 600 }}>
                                <Typography>Fill Form</Typography>
                                <ArrowRight01Icon size={20} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </AuthLayout>
    );
};

export default MethodSelectionPage;
