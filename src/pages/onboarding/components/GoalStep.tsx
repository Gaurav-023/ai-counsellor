import { Box, Button, TextField, Typography, Grid, MenuItem, Autocomplete } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema, type GoalData } from '../../../lib/schemas';
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
    '& .MuiAutocomplete-popupIndicator': { color: 'white' },
    '& .MuiChip-root': { bgcolor: 'rgba(255,255,255,0.2)', color: 'white' },
};

const commonDegrees = [
    "Bachelor's Degree",
    "Master's Degree",
    "PhD / Doctorate",
    "Diploma / Certificate",
    "Associate Degree",
    "MBA"
];

const commonCountries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "Ireland",
    "New Zealand",
    "France",
    "Netherlands",
    "Sweden"
];

interface StepProps {
    onNext: () => void;
    onBack: () => void;
}

const GoalStep = ({ onNext, onBack }: StepProps) => {
    const { goals, setGoals } = useOnboardingStore();

    const { register, control, handleSubmit, formState: { errors } } = useForm<GoalData>({
        resolver: zodResolver(goalSchema),
        defaultValues: goals || { preferredCountries: [] }
    });

    const onSubmit = (data: GoalData) => {
        setGoals(data);
        onNext();
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h5" gutterBottom fontWeight="bold">Study Goals</Typography>
            <Typography variant="body2" sx={{ mb: 4, opacity: 0.7 }}>
                What are you looking to achieve?
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Controller
                        name="intendedDegree"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                fullWidth
                                label="Intended Degree"
                                placeholder="Select your target degree"
                                variant="outlined"
                                sx={glassInputSx}
                                error={!!errors.intendedDegree}
                                helperText={errors.intendedDegree?.message}
                            >
                                {commonDegrees.map((deg) => (
                                    <MenuItem key={deg} value={deg}>{deg}</MenuItem>
                                ))}
                            </TextField>
                        )}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Intended Major / Field of Study"
                        placeholder="e.g. Computer Science, Business Analytics"
                        variant="outlined"
                        sx={glassInputSx}
                        {...register('fieldOfStudy')}
                        error={!!errors.fieldOfStudy}
                        helperText={errors.fieldOfStudy?.message}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography gutterBottom sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', mb: 1 }}>
                        Preferred Countries
                    </Typography>
                    <Controller
                        name="preferredCountries"
                        control={control}
                        render={({ field: { onChange, value, ref } }) => (
                            <Autocomplete
                                multiple
                                options={commonCountries}
                                value={value || []}
                                onChange={(_, newValue) => onChange(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        placeholder={value?.length ? "" : "Select countries"}
                                        sx={glassInputSx}
                                        error={!!errors.preferredCountries}
                                        helperText={errors.preferredCountries?.message}
                                        inputRef={ref}
                                    />
                                )}
                                ChipProps={{ size: 'small' }}
                            />
                        )}
                    />
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

export default GoalStep;
