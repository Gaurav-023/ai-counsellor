
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    InputAdornment,

    Stack,
    IconButton,
    Alert
} from '@mui/material';
import {
    Mail01Icon,
    LockPasswordIcon,
    ViewIcon,
    ViewOffIcon,
} from 'hugeicons-react'; // Assuming hugeicons or standard icons
import AuthLayout from './components/AuthLayout';
import { supabase } from '../../lib/supabase';

// Custom TextField styles for glassmorphism
const glassInputSx = {
    '& .MuiOutlinedInput-root': {
        color: 'white',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(5px)',
        borderRadius: '12px',
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'white',
        },
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: 'white',
    },
    '& .MuiInputAdornment-root': {
        color: 'rgba(255, 255, 255, 0.7)',
    }
};

const LoginPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            if (user) {
                // Check if user has completed onboarding
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_onboarding_complete')
                    .eq('id', user.id)
                    .single();

                if (profile?.is_onboarding_complete) {
                    navigate('/dashboard'); // Go to dashboard if complete
                } else {
                    navigate('/onboarding-method'); // Go to method selection if incomplete
                }
            } else {
                navigate('/dashboard');
            }

        } catch (err: any) {
            setError(err.message === "Invalid login credentials"
                ? "Incorrect email or password."
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                    Login
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Access your personalized study abroad roadmap
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack spacing={3} component="form" onSubmit={handleLogin}>
                <TextField
                    fullWidth
                    label="Email ID"
                    placeholder="you@example.com"
                    variant="outlined"
                    sx={glassInputSx}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Mail01Icon size={20} />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    variant="outlined"
                    sx={glassInputSx}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockPasswordIcon size={20} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClickShowPassword}
                                    edge="end"
                                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                                >
                                    {showPassword ? <ViewIcon size={20} /> : <ViewOffIcon size={20} />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />


                <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={loading}
                    sx={{
                        // Using standard primary color (solid) instead of white or gradients
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '30px',
                        py: 1.5,
                        fontWeight: 'bold',
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        '&.Mui-disabled': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.3)'
                        }
                    }}
                    type="submit"
                >
                    {loading ? 'Signing In...' : 'Login'}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Don't have an account?{' '}
                        <Typography
                            component={RouterLink}
                            to="/signup"
                            variant="body2"
                            sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Register
                        </Typography>
                    </Typography>
                </Box>
            </Stack>
        </AuthLayout>
    );
};

export default LoginPage;
