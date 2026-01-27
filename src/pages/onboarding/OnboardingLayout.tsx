import { Box, Container, Paper, Typography, Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { CheckmarkCircle01Icon, ArrowLeft01Icon } from 'hugeicons-react';
import { Link } from 'react-router-dom';

interface OnboardingLayoutProps {
    children: ReactNode;
    currentStep: number;
    steps: string[];
}

// Custom connector for the stepper to match the glassmorphism theme
const ColorlibConnector = styled(StepConnector)(() => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundColor: 'rgb(79, 70, 229)', // Solid color - Clean look
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundColor: 'rgb(79, 70, 229)', // Solid color
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 1,
    },
}));

// Custom Step Icon
const ColorlibStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
}>(({ ownerState }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    ...(ownerState.active && {
        backgroundImage:
            'linear-gradient( 136deg, rgb(79, 70, 229) 0%, rgb(124, 58, 237) 50%, rgb(236, 72, 153) 100%)', // Match the auth gradient
        boxShadow: '0 4px 20px 0 rgba(0,0,0,.25)',
        border: 'none',
    }),
    ...(ownerState.completed && {
        backgroundImage:
            'linear-gradient( 136deg, rgb(79, 70, 229) 0%, rgb(124, 58, 237) 50%, rgb(236, 72, 153) 100%)',
        border: 'none',
    }),
}));

function ColorlibStepIcon(props: any) { // Type 'any' used to bypass complicated StepIconProps from MUI for now
    const { active, completed, className, icon } = props;

    const icons: { [index: string]: React.ReactElement } = {
        1: <Typography fontWeight="bold">1</Typography>,
        2: <Typography fontWeight="bold">2</Typography>,
        3: <Typography fontWeight="bold">3</Typography>,
        4: <Typography fontWeight="bold">4</Typography>,
    };

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {completed ? <CheckmarkCircle01Icon size={24} /> : icons[String(icon)]}
        </ColorlibStepIconRoot>
    );
}

const OnboardingLayout = ({ children, currentStep, steps }: OnboardingLayoutProps) => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                // Same scenic background as Auth pages
                background: `
                    linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)),
                    url('/login-bg.webp')
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed', // Keep background fixed while scrolling
                position: 'relative',
                pt: 4,
                pb: 8,
            }}
        >
            <Box
                component={Link}
                to="/"
                sx={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    zIndex: 10,
                    display: { xs: 'none', sm: 'flex' }, // Hide on mobile if space is tight, or adjust top/left
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
                <Typography variant="subtitle2" fontWeight="medium">Back to Home</Typography>
            </Box>

            {/* Header/Logo Area */}
            <Typography variant="h4" sx={{ color: 'white', mb: 1, fontWeight: 'bold', mt: { xs: 8, sm: 0 } }}>
                Setup Your Profile
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 6 }}>
                Let's personalize your AI Counsellor experience
            </Typography>

            <Container maxWidth="md">
                <Stepper alternativeLabel activeStep={currentStep} connector={<ColorlibConnector />} sx={{ mb: 6 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel StepIconComponent={ColorlibStepIcon}>
                                <Typography sx={{ color: 'white', fontWeight: currentStep === steps.indexOf(label) ? 'bold' : 'normal' }}>
                                    {label}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <motion.div
                    key={currentStep} // Animate when step changes
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            p: { xs: 3, sm: 5 },
                            borderRadius: 4,
                            // Glassmorphism effect consistent with AuthLayout
                            bgcolor: 'rgba(25, 25, 35, 0.4)', // Slightly darker for contrast
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            minHeight: '400px' // Ensure some height consistency
                        }}
                    >
                        {children}
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default OnboardingLayout;
