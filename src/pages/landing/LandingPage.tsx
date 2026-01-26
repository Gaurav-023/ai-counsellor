import { Box } from '@mui/material';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';

const LandingPage = () => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            <LandingNavbar />
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
        </Box>
    );
};

export default LandingPage;
