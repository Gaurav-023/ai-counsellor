import { Box, Button, Typography, Grid, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, CircularProgress, TextField } from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { readinessSchema, type ReadinessData } from '../../../lib/schemas';
import { useOnboardingStore } from '../../../store/onboardingStore';

// Reuse glass input style
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
};

interface StepProps {
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

const ReadinessStep = ({ onSubmit, onBack, isSubmitting }: StepProps) => {
    const { readiness, setReadiness } = useOnboardingStore();

    const { control, handleSubmit, register, formState: { errors } } = useForm<ReadinessData>({
        resolver: zodResolver(readinessSchema),
        defaultValues: readiness || {
            examIelts: 'not_taken',
            examGre: 'not_taken',
            examIeltsScore: '',
            examGreScore: ''
        }
    });

    const ieltsStatus = useWatch({ control, name: 'examIelts' });
    const greStatus = useWatch({ control, name: 'examGre' });

    const onFormSubmit = (data: ReadinessData) => {
        setReadiness(data);
        onSubmit();
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
            <Typography variant="h5" gutterBottom fontWeight="bold">Exam Readiness</Typography>
            <Typography variant="body2" sx={{ mb: 4, opacity: 0.7 }}>
                Let us know where you stand with entrance exams.
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend" sx={{ color: 'white', mb: 1 }}>IELTS / TOEFL Status</FormLabel>
                        <Controller
                            rules={{ required: true }}
                            control={control}
                            name="examIelts"
                            render={({ field }) => (
                                <RadioGroup {...field} row>
                                    <FormControlLabel value="not_taken" control={<Radio sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: 'white' } }} />} label="Not Taken" sx={{ color: 'rgba(255,255,255,0.9)' }} />
                                    <FormControlLabel value="planned" control={<Radio sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: 'white' } }} />} label="Planned" sx={{ color: 'rgba(255,255,255,0.9)' }} />
                                    <FormControlLabel value="taken" control={<Radio sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: 'white' } }} />} label="Taken" sx={{ color: 'rgba(255,255,255,0.9)' }} />
                                </RadioGroup>
                            )}
                        />
                        {ieltsStatus === 'taken' && (
                            <Box sx={{ mt: 2, maxWidth: 200 }}>
                                <TextField
                                    fullWidth
                                    label="Your Score"
                                    placeholder="e.g. 7.5"
                                    variant="outlined"
                                    sx={glassInputSx}
                                    {...register('examIeltsScore')}
                                    error={!!errors.examIeltsScore}
                                    helperText={errors.examIeltsScore?.message}
                                />
                            </Box>
                        )}
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend" sx={{ color: 'white', mb: 1 }}>GRE / GMAT Status</FormLabel>
                        <Controller
                            rules={{ required: true }}
                            control={control}
                            name="examGre"
                            render={({ field }) => (
                                <RadioGroup {...field} row>
                                    <FormControlLabel value="not_taken" control={<Radio sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: 'white' } }} />} label="Not Taken" sx={{ color: 'rgba(255,255,255,0.9)' }} />
                                    <FormControlLabel value="planned" control={<Radio sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: 'white' } }} />} label="Planned" sx={{ color: 'rgba(255,255,255,0.9)' }} />
                                    <FormControlLabel value="taken" control={<Radio sx={{ color: 'rgba(255,255,255,0.7)', '&.Mui-checked': { color: 'white' } }} />} label="Taken" sx={{ color: 'rgba(255,255,255,0.9)' }} />
                                </RadioGroup>
                            )}
                        />
                        {greStatus === 'taken' && (
                            <Box sx={{ mt: 2, maxWidth: 200 }}>
                                <TextField
                                    fullWidth
                                    label="Your Score"
                                    placeholder="e.g. 320"
                                    variant="outlined"
                                    sx={glassInputSx}
                                    {...register('examGreScore')}
                                    error={!!errors.examGreScore}
                                    helperText={errors.examGreScore?.message}
                                />
                            </Box>
                        )}
                    </FormControl>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                <Button variant="outlined" onClick={onBack} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{
                        background: 'linear-gradient(136deg, rgb(236, 72, 153) 0%, rgb(225, 29, 72) 100%)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2
                    }}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSubmitting ? 'Completing...' : 'Complete Setup'}
                </Button>
            </Box>
        </Box>
    );
};

export default ReadinessStep;
