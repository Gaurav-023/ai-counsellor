import { create } from 'zustand';
import type { AcademicData, GoalData, BudgetData, ReadinessData } from '../lib/schemas';

interface OnboardingState {
    academic: AcademicData | null;
    goals: GoalData | null;
    budget: BudgetData | null;
    readiness: ReadinessData | null;

    setAcademic: (data: AcademicData) => void;
    setGoals: (data: GoalData) => void;
    setBudget: (data: BudgetData) => void;
    setReadiness: (data: ReadinessData) => void;
    reset: () => void;

    // Computed property to check if all steps are possibly filled (shallow check)
    isComplete: () => boolean;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
    academic: null,
    goals: null,
    budget: null,
    readiness: null,

    setAcademic: (data) => set({ academic: data }),
    setGoals: (data) => set({ goals: data }),
    setBudget: (data) => set({ budget: data }),
    setReadiness: (data) => set({ readiness: data }),

    reset: () => set({ academic: null, goals: null, budget: null, readiness: null }),

    isComplete: () => {
        const s = get();
        return !!(s.academic && s.goals && s.budget && s.readiness);
    }
}));
