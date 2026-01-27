import { Box, Button, TextField, Typography, Grid, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { budgetSchema, type BudgetData } from '../../../lib/schemas';
import { useOnboardingStore } from '../../../store/onboardingStore';

const glassInputSx = {
    '& .MuiOutlinedInput-root': {
        color: 'white',
        bgcolor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(5px)',
        borderRadius: '12px',
        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
        '&.Mui-focused fieldset': { borderColor: 'white' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
    '& .MuiSelect-icon': { color: 'white' },
};

interface StepProps {
    onNext: () => void;
    onBack: () => void;
}

const budgetRanges = [
    { value: 'under_20k', label: 'Under $20,000' },
    { value: '20k_40k', label: '$20,000 - $40,000' },
    { value: '40k_60k', label: '$40,000 - $60,000' },
    { value: '60k_plus', label: '$60,000+' },
];

const fundingSources = [
    { value: 'self', label: 'Self Funded / Family' },
    { value: 'loan', label: 'Education Loan' },
    { value: 'scholarship', label: 'Scholarship Required' },
    { value: 'mixed', label: 'Mixed Sources' },
];

const BudgetStep = ({ onNext, onBack }: StepProps) => {
    const { budget, setBudget } = useOnboardingStore();

    const { register, handleSubmit, formState: { errors } } = useForm<BudgetData>({
        resolver: zodResolver(budgetSchema),
        defaultValues: budget || {}
    });

    const onSubmit = (data: BudgetData) => {
        setBudget(data);
        onNext();
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h5" gutterBottom fontWeight="bold">Budget & Finance</Typography>
            <Typography variant="body2" sx={{ mb: 4, opacity: 0.7 }}>
                Help us find universities that match your financial plan.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        select
                        fullWidth
                        label="Annual Tuition Budget"
                        variant="outlined"
                        sx={glassInputSx}
                        defaultValue=""
                        {...register('budgetRange')}
                        error={!!errors.budgetRange}
                        helperText={errors.budgetRange?.message}
                    >
                        {budgetRanges.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        select
                        fullWidth
                        label="Primary Funding Source"
                        variant="outlined"
                        sx={glassInputSx}
                        defaultValue=""
                        {...register('fundingSource')}
                        error={!!errors.fundingSource}
                        helperText={errors.fundingSource?.message}
                    >
                        {fundingSources.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button variant="outlined" onClick={onBack} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    type="submit"
                    sx={{
                        background: 'linear-gradient(136deg, rgb(79, 70, 229) 0%, rgb(124, 58, 237) 100%)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2
                    }}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );
};

export default BudgetStep;
