import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                background: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.95)), url('/login-bg.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                p: 4,
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 8 }}>
                    <Typography variant="h4" fontWeight="bold">
                        AI Counsellor Dashboard
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                        Log Out
                    </Button>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h3" gutterBottom sx={{ background: 'linear-gradient(136deg, rgb(79, 70, 229) 0%, rgb(236, 72, 153) 100%)', backgroundClip: 'text', color: 'transparent', fontWeight: 'bold' }}>
                        Welcome Future Scholar!
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', mx: 'auto', mt: 2 }}>
                        Your profile is set up. Our AI agents are currently analyzing your data to provide the best university recommendations.
                    </Typography>

                    <Typography sx={{ mt: 8, opacity: 0.5, fontSize: '0.9rem' }}>
                        Dashboard features coming soon...
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default DashboardPage;
