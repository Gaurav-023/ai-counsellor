import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/dashboard/DashboardPage';
import DashboardLayout from './layouts/DashboardLayout';
import UniversitiesPage from './pages/universities/UniversitiesPage';
import ShortlistPage from './pages/shortlist/ShortlistPage';
import ProfilePage from './pages/profile/ProfilePage';
import ApplicationPage from './pages/application/ApplicationPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
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
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Onboarding Route */}
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
