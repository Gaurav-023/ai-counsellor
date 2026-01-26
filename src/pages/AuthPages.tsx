import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    InputAdornment,
    Checkbox,
    FormControlLabel,
    Stack,
    alpha
} from '@mui/material';
import {
    EmailOutlined,
    LockOutlined,
    ArrowForward,
    SmartToy,
    PersonOutline
} from '@mui/icons-material';

const AuthLayout = ({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle: string }) => (
    <Box
        sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: (theme) => `radial-gradient(circle at 50% 10%, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${theme.palette.background.default} 70%)`,
            p: 2
        }}
    >
        <Container maxWidth="xs">
            <Paper
                elevation={24}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Stack alignItems="center" spacing={2} mb={4}>
                    <Box
                        component={RouterLink}
                        to="/"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.main',
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            color: 'white',
                            mb: 1,
                            textDecoration: 'none'
                        }}
                    >
                        <SmartToy />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" align="center">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                        {subtitle}
                    </Typography>
                </Stack>
                {children}
            </Paper>
        </Container>
    </Box>
);

export const Login = () => {
    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to continue your journey">
            <Stack spacing={3} component="form">
                <TextField
                    fullWidth
                    label="Email address"
                    placeholder="you@example.com"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailOutlined color="action" />
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockOutlined color="action" />
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
                    />
                    <Typography
                        component="a"
                        href="#"
                        variant="body2"
                        color="primary"
                        sx={{ textDecoration: 'none', fontWeight: 600 }}
                    >
                        Forgot password?
                    </Typography>
                </Stack>

                <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    type="submit"
                >
                    Sign In
                </Button>

                <Typography variant="body2" align="center" color="text.secondary">
                    Don't have an account?{' '}
                    <Typography
                        component={RouterLink}
                        to="/signup"
                        color="primary"
                        variant="body2"
                        fontWeight={600}
                        sx={{ textDecoration: 'none' }}
                    >
                        Sign up
                    </Typography>
                </Typography>
            </Stack>
        </AuthLayout>
    );
};

export const Signup = () => {
    return (
        <AuthLayout title="Create an account" subtitle="Start your study abroad journey today">
            <Stack spacing={3} component="form">
                <TextField
                    fullWidth
                    label="Full Name"
                    placeholder="John Doe"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <PersonOutline color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    fullWidth
                    label="Email address"
                    placeholder="you@example.com"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailOutlined color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockOutlined color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    type="submit"
                    endIcon={<ArrowForward />}
                >
                    Create Account
                </Button>

                <Typography variant="body2" align="center" color="text.secondary">
                    Already have an account?{' '}
                    <Typography
                        component={RouterLink}
                        to="/login"
                        color="primary"
                        variant="body2"
                        fontWeight={600}
                        sx={{ textDecoration: 'none' }}
                    >
                        Log in
                    </Typography>
                </Typography>
            </Stack>
        </AuthLayout>
    );
};
