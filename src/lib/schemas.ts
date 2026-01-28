import { z } from 'zod';

export const academicSchema = z.object({
    educationLevel: z.string().min(1, 'Education level is required'),
    degreeMajor: z.string().min(1, 'Major is required'),
    gpa: z.string().min(1, 'GPA/Percentage is required'),
    graduationYear: z.string().min(4, 'Enter a valid year'),
});

export const goalSchema = z.object({
    intendedDegree: z.string().min(1, 'Intended degree is required'),
    fieldOfStudy: z.string().min(1, 'Intended major/field is required'),
    preferredCountries: z.array(z.string()).min(1, 'Select at least one country'),
});

export const budgetSchema = z.object({
    budgetRange: z.string().min(1, 'Budget range is required'),
    fundingSource: z.string().min(1, 'Funding source is required'),
});

export const readinessSchema = z.object({
    examIelts: z.enum(['not_taken', 'planned', 'taken']),
    examIeltsScore: z.string().optional(),
    examGre: z.enum(['not_taken', 'planned', 'taken']),
    examGreScore: z.string().optional(),
}).refine((data) => {
    if (data.examIelts === 'taken' && !data.examIeltsScore) return false;
    return true;
}, {
    message: "Score is required if taken",
    path: ["examIeltsScore"]
}).refine((data) => {
    if (data.examGre === 'taken' && !data.examGreScore) return false;
    return true;
}, {
    message: "Score is required if taken",
    path: ["examGreScore"]
});

export type AcademicData = z.infer<typeof academicSchema>;
export type GoalData = z.infer<typeof goalSchema>;
export type BudgetData = z.infer<typeof budgetSchema>;
export type ReadinessData = z.infer<typeof readinessSchema>;
