import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    InputAdornment,
    Stack,
    IconButton,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Alert
} from '@mui/material';
import {
    Mail01Icon,
    LockPasswordIcon,
    UserIcon,
    ArrowRight01Icon,
    ViewIcon,
    ViewOffIcon,
    MailValidation01Icon
} from 'hugeicons-react';
import AuthLayout from './components/AuthLayout';
import { supabase } from '../../lib/supabase';

// Shared glass input styles
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

const SignupPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVerifyDialog, setShowVerifyDialog] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Show verification dialog on success
            setShowVerifyDialog(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                    Sign Up
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Start your journey to a dream university
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack spacing={3} component="form" onSubmit={handleSignup}>
                <TextField
                    fullWidth
                    label="Full Name"
                    placeholder="John Doe"
                    variant="outlined"
                    sx={glassInputSx}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <UserIcon size={20} />
                            </InputAdornment>
                        ),
                    }}
                />
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
                    endIcon={loading ? null : <ArrowRight01Icon size={20} />}
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Already have an account?{' '}
                        <Typography
                            component={RouterLink}
                            to="/login"
                            variant="body2"
                            sx={{
                                color: 'white',
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Log in
                        </Typography>
                    </Typography>
                </Box>
            </Stack>

            {/* Verification Dialog */}
            <Dialog
                open={showVerifyDialog}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 2, textAlign: 'center' }
                }}
            >
                <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.main', borderRadius: '50%', bgOpacity: 0.1 }}>
                        <MailValidation01Icon size={48} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold">Check your email</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        We've sent a verification link to <b>{email}</b>.
                        <br />
                        Please verify your email address to log in.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => window.location.href = '/login'}
                        sx={{ borderRadius: 20, px: 4 }}
                    >
                        Go to Login
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthLayout>
    );
};

export default SignupPage;
