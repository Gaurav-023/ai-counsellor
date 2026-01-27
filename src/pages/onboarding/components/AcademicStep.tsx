import { Box, Button, TextField, Typography, Grid, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { academicSchema, type AcademicData } from '../../../lib/schemas';
import { useOnboardingStore } from '../../../store/onboardingStore';

// Common glass input style
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
    onNext: () => void;
}

const AcademicStep = ({ onNext }: StepProps) => {
    const { academic, setAcademic } = useOnboardingStore();

    const { register, handleSubmit, formState: { errors } } = useForm<AcademicData>({
        resolver: zodResolver(academicSchema),
        defaultValues: academic || {}
    });

    const onSubmit = (data: AcademicData) => {
        setAcademic(data);
        onNext();
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h5" gutterBottom fontWeight="bold">Academic Background</Typography>
            <Typography variant="body2" sx={{ mb: 4, opacity: 0.7 }}>
                Tell us about your current educational status.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        fullWidth
                        label="Education Level"
                        placeholder="Select Level"
                        variant="outlined"
                        sx={glassInputSx}
                        defaultValue=""
                        {...register('educationLevel')}
                        error={!!errors.educationLevel}
                        helperText={errors.educationLevel?.message}
                    >
                        <MenuItem value="High School">High School</MenuItem>
                        <MenuItem value="Undergraduate">Undergraduate</MenuItem>
                        <MenuItem value="Postgraduate">Postgraduate</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Graduation Year"
                        placeholder="e.g. 2024"
                        variant="outlined"
                        sx={glassInputSx}
                        {...register('graduationYear')}
                        error={!!errors.graduationYear}
                        helperText={errors.graduationYear?.message}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Major / Field of Study"
                        placeholder="e.g. Computer Science"
                        variant="outlined"
                        sx={glassInputSx}
                        {...register('degreeMajor')}
                        error={!!errors.degreeMajor}
                        helperText={errors.degreeMajor?.message}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="GPA / Percentage"
                        placeholder="e.g. 3.8 or 85%"
                        variant="outlined"
                        sx={glassInputSx}
                        {...register('gpa')}
                        error={!!errors.gpa}
                        helperText={errors.gpa?.message}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
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

export default AcademicStep;
