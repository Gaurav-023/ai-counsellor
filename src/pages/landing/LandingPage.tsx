import { Box } from '@mui/material';
import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import AICounselorSection from './components/AICounselorSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import LogoMarquee from './components/LogoMarquee';

const LandingPage = () => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', bgcolor: '#ffffff', color: '#0F172A' }}>
            <LandingNavbar />
            <HeroSection />
            <AICounselorSection />
            <FeaturesSection />
            <LogoMarquee />
            <HowItWorksSection />
        </Box>
    );
};

export default LandingPage;
