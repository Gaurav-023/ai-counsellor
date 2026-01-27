import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [onboardingComplete, setOnboardingComplete] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);

                // Check onboarding status
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_onboarding_complete')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.is_onboarding_complete) {
                    setOnboardingComplete(true);
                }
            }
            setLoading(false);
        };

        checkUser();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0f172a' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!onboardingComplete) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
