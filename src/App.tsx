import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import GlobalLoader from './components/GlobalLoader';
import './App.css';

// Lazy Load Pages
const LandingPage = React.lazy(() => import('./pages/landing/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/auth/SignupPage'));
const OnboardingPage = React.lazy(() => import('./pages/onboarding/OnboardingPage'));
const MethodSelectionPage = React.lazy(() => import('./pages/onboarding/MethodSelectionPage'));
const AIOnboardingPage = React.lazy(() => import('./pages/onboarding/AIOnboardingPage'));

const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const UniversitiesPage = React.lazy(() => import('./pages/universities/UniversitiesPage'));
const ShortlistPage = React.lazy(() => import('./pages/shortlist/ShortlistPage'));
const ApplicationPage = React.lazy(() => import('./pages/application/ApplicationPage'));
const AICounselorPage = React.lazy(() => import('./pages/counselor/AICounselorPage'));
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));

const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense fallback={<GlobalLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/universities" element={<UniversitiesPage />} />
                <Route path="/shortlist" element={<ShortlistPage />} />
                <Route path="/application" element={<ApplicationPage />} />
                <Route path="/counselor" element={<AICounselorPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Onboarding Routes */}
            <Route path="/onboarding-method" element={<MethodSelectionPage />} />
            <Route path="/onboarding-ai" element={<AIOnboardingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
