import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    alpha,
    useTheme
} from '@mui/material';
import { SmartToy } from '@mui/icons-material';

const LandingNavbar = () => {
    const theme = useTheme();

    return (
        <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(10px)', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <SmartToy sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'inherit',
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'text.primary',
                            textDecoration: 'none',
                        }}
                    >
                        AI Counsellor
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button color="inherit" component={RouterLink} to="/login" sx={{ mr: 2, color: 'text.primary' }}>
                        Login
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to="/signup"
                    >
                        Get Started
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default LandingNavbar;
