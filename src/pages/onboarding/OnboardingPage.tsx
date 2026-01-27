import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import OnboardingLayout from './OnboardingLayout';
import AcademicStep from './components/AcademicStep';
import GoalStep from './components/GoalStep';
import BudgetStep from './components/BudgetStep';
import ReadinessStep from './components/ReadinessStep';
import { useOnboardingStore } from '../../store/onboardingStore';
import { supabase } from '../../lib/supabase';

const STEPS = ['Academic', 'Goals', 'Budget', 'Readiness'];

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const { academic, goals, budget, readiness, reset } = useOnboardingStore();

    // TanStack Query Mutation for submitting data
    const submissionMutation = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user");

            const completeData = {
                id: user.id, // Fixed: Schema uses 'id', not 'user_id'
                education_level: academic?.educationLevel,
                degree_major: academic?.degreeMajor,
                graduation_year: parseInt(academic?.graduationYear || '0'),
                gpa: academic?.gpa,
                intended_degree: goals?.intendedDegree,
                preferred_countries: goals?.preferredCountries,
                budget_range: budget?.budgetRange,
                funding_source: budget?.fundingSource,
                exam_ielts_status: readiness?.examIelts,
                exam_ielts_score: readiness?.examIeltsScore,
                exam_gre_status: readiness?.examGre,
                exam_gre_score: readiness?.examGreScore,
            };

            // Insert student profile
            const { error: profileError } = await supabase
                .from('student_profiles')
                .insert(completeData);

            if (profileError) throw profileError;

            // Update main profile status
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_onboarding_complete: true })
                .eq('id', user.id);

            if (updateError) throw updateError;

            return true;
        },
        onSuccess: () => {
            reset(); // Clear store
            navigate('/'); // Redirect to dashboard
        },
        onError: (error) => {
            console.error('Onboarding submission failed:', error);
            // In a real app, you'd show a toast/snackbar here
            alert("Failed to save profile. Please try again.");
        }
    });

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleFinalSubmit = () => {
        submissionMutation.mutate();
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <AcademicStep onNext={handleNext} />;
            case 1:
                return <GoalStep onNext={handleNext} onBack={handleBack} />;
            case 2:
                return <BudgetStep onNext={handleNext} onBack={handleBack} />;
            case 3:
                return (
                    <ReadinessStep
                        onSubmit={handleFinalSubmit}
                        onBack={handleBack}
                        isSubmitting={submissionMutation.isPending}
                    />
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <OnboardingLayout currentStep={activeStep} steps={STEPS}>
            {getStepContent(activeStep)}
        </OnboardingLayout>
    );
};

export default OnboardingPage;
