import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Divider,
    MenuItem,
    Chip,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import {
    UserCircleIcon,
    Globe02Icon,
    Coins01Icon,
    BookOpen01Icon,
    CheckmarkCircle01Icon
} from 'hugeicons-react';
import { supabase } from '../../lib/supabase';
import { updateStudentProfile } from '../../lib/api';
import { events } from '../../lib/events';

// --- Constants (Matched with Onboarding) ---


const fundingSources = [
    { value: 'self', label: 'Self Funded / Family' },
    { value: 'loan', label: 'Education Loan' },
    { value: 'scholarship', label: 'Scholarship Required' },
    { value: 'mixed', label: 'Mixed Sources' },
];

const commonDegrees = [
    "Bachelor's Degree",
    "Master's Degree",
    "PhD / Doctorate",
    "Diploma / Certificate",
    "Associate Degree",
    "MBA"
];

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        email: '', // Added Email
        full_name: '',
        education_level: '',
        degree_major: '',
        gpa: '',
        graduation_year: '',
        intended_degree: '',
        field_of_study: '',
        preferred_countries: [] as string[],
        budget_range: '',
        funding_source: '', // Added funding_source
        exam_ielts_status: '',
        exam_ielts_score: '',
        exam_gre_status: '',
        exam_gre_score: ''
    });

    useEffect(() => {
        loadProfile();

        // Subscribe to global updates (e.g. from AI Chat actions)
        const unsubscribe = events.subscribe(() => {
            console.log("Profile refreshing due to global event...");
            loadProfile();
        });
        return () => { unsubscribe(); };
    }, []);

    const loadProfile = async () => {
        try {
            // setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("No user found in ProfilePage loadProfile");
                return;
            }

            console.log("Fetching profile for user:", user.id);

            // 1. Fetch Basic Profile
            const { data: basicProfile, error: basicError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (basicError) console.error("Basic Profile Fetch Error:", basicError);

            // 2. Fetch Student Details (Directly like Onboarding)
            const { data: studentDetails, error: studentError } = await supabase
                .from('student_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (studentError) console.error("Student Profile Fetch Error:", studentError);
            console.log("Student Details fetched:", studentDetails);

            // 3. Populate State
            setFormData({
                email: user.email || '',
                full_name: basicProfile?.full_name || '',

                // Student Details (with optional chaining safety)
                education_level: studentDetails?.education_level || '',
                degree_major: studentDetails?.degree_major || '',
                gpa: studentDetails?.gpa || '',
                graduation_year: studentDetails?.graduation_year?.toString() || '',

                intended_degree: studentDetails?.intended_degree || '',
                field_of_study: studentDetails?.field_of_study || '',
                preferred_countries: studentDetails?.preferred_countries || [],
                budget_range: studentDetails?.budget_range || '',
                funding_source: studentDetails?.funding_source || '',

                exam_ielts_status: studentDetails?.exam_ielts_status || 'Not Taken',
                exam_ielts_score: studentDetails?.exam_ielts_score || '',
                exam_gre_status: studentDetails?.exam_gre_status || 'Not Taken',
                exam_gre_score: studentDetails?.exam_gre_score || ''
            });

        } catch (err) {
            console.error("Failed to load profile", err);
            setNotification({ message: 'Failed to load profile data', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Exclude 'email' as it's not in student_profiles table
            const { email, ...profileData } = formData;

            await updateStudentProfile({
                ...profileData,
                graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null
            });

            // Notify other components (Dashboard, etc) that profile has changed
            events.emit();

            // Re-fetch to ensure local state matches DB
            await loadProfile();

            setNotification({ message: 'Profile updated successfully! Recommendations will be recalculated.', type: 'success' });
        } catch (err: any) {
            setNotification({ message: 'Failed to save: ' + err.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#0f172a' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 8 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="#0f172a">Your Profile</Typography>
                    <Typography variant="body1" color="#64748b">
                        Manage your academic details and preferences.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckmarkCircle01Icon />}
                    sx={{
                        bgcolor: '#0f172a',
                        color: 'white',
                        fontWeight: 700,
                        px: 4,
                        '&:hover': { bgcolor: '#334155' }
                    }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Personal & Academic */}
                <Grid item xs={12} md={8}>
                    {/* Identity Section */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                            <Box sx={{
                                width: 80, height: 80,
                                borderRadius: '50%',
                                bgcolor: '#0f172a',
                                color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem', fontWeight: 800
                            }}>
                                {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : 'U'}
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Profile Picture</Typography>
                                <Typography variant="body2" color="text.secondary">Currently using default avatar</Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Full Name"
                                    value={formData.full_name}
                                    onChange={(e) => handleChange('full_name', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Email Address"
                                    value={formData.email}
                                    disabled
                                    InputProps={{ readOnly: true, sx: { bgcolor: '#f8fafc' } }}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', mb: 3 }}>
                        <Typography variant="h6" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <UserCircleIcon color="#0f172a" /> Academic History
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="Current Education Level"
                                    value={formData.education_level}
                                    onChange={(e) => handleChange('education_level', e.target.value)}
                                >
                                    <MenuItem value="High School">High School</MenuItem>
                                    <MenuItem value="Undergraduate">Undergraduate</MenuItem>
                                    <MenuItem value="Postgraduate">Postgraduate</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Major / Stream"
                                    value={formData.degree_major}
                                    onChange={(e) => handleChange('degree_major', e.target.value)}
                                    placeholder="e.g. Computer Science / PCM"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Current GPA / Percentage"
                                    value={formData.gpa}
                                    onChange={(e) => handleChange('gpa', e.target.value)}
                                    helperText="e.g. 3.8/4.0 or 85%"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Graduation Year"
                                    type="number"
                                    value={formData.graduation_year}
                                    onChange={(e) => handleChange('graduation_year', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                        <Typography variant="h6" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BookOpen01Icon color="#0f172a" /> Standardized Tests
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="IELTS / TOEFL Status"
                                    value={formData.exam_ielts_status}
                                    onChange={(e) => handleChange('exam_ielts_status', e.target.value)}
                                >
                                    <MenuItem value="Not Taken">Not Taken</MenuItem>
                                    <MenuItem value="Planned">Planned</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                </TextField>
                            </Grid>
                            {formData.exam_ielts_status === 'Completed' && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth label="Score"
                                        value={formData.exam_ielts_score}
                                        onChange={(e) => handleChange('exam_ielts_score', e.target.value)}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select fullWidth label="GRE / GMAT Status"
                                    value={formData.exam_gre_status}
                                    onChange={(e) => handleChange('exam_gre_status', e.target.value)}
                                >
                                    <MenuItem value="Not Taken">Not Taken</MenuItem>
                                    <MenuItem value="Planned">Planned</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                </TextField>
                            </Grid>
                            {formData.exam_gre_status === 'Completed' && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth label="Score"
                                        value={formData.exam_gre_score}
                                        onChange={(e) => handleChange('exam_gre_score', e.target.value)}
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Preferences Sidebar */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: '100%' }}>
                        <Typography variant="h6" fontWeight="700" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe02Icon color="#0f172a" /> Study Goals
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                fullWidth label="Intended Major"
                                value={formData.field_of_study}
                                onChange={(e) => handleChange('field_of_study', e.target.value)}
                                helperText="What you want to study abroad"
                            />
                            <TextField
                                select fullWidth label="Target Degree"
                                value={formData.intended_degree}
                                onChange={(e) => handleChange('intended_degree', e.target.value)}
                            >
                                {commonDegrees.map(deg => (
                                    <MenuItem key={deg} value={deg}>{deg}</MenuItem>
                                ))}
                            </TextField>

                            <Divider />

                            <Box>
                                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Coins01Icon size={16} /> Budget & Funding
                                </Typography>
                                <TextField
                                    fullWidth label="Budget Range"
                                    placeholder="e.g. $25k or Flexible"
                                    value={formData.budget_range}
                                    onChange={(e) => handleChange('budget_range', e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    select fullWidth label="Funding Source"
                                    value={formData.funding_source}
                                    onChange={(e) => handleChange('funding_source', e.target.value)}
                                >
                                    {fundingSources.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1 }}>Preferred Countries</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                    {formData.preferred_countries.map(c => (
                                        <Chip
                                            key={c}
                                            label={c}
                                            onDelete={() => {
                                                handleChange('preferred_countries', formData.preferred_countries.filter(x => x !== c));
                                            }}
                                            sx={{ borderRadius: 2 }}
                                        />
                                    ))}
                                </Box>
                                <TextField
                                    select fullWidth label="Add Country"
                                    value=""
                                    onChange={(e) => {
                                        if (e.target.value && !formData.preferred_countries.includes(e.target.value)) {
                                            handleChange('preferred_countries', [...formData.preferred_countries, e.target.value]);
                                        }
                                    }}
                                >
                                    <MenuItem value="USA">USA</MenuItem>
                                    <MenuItem value="UK">UK</MenuItem>
                                    <MenuItem value="Canada">Canada</MenuItem>
                                    <MenuItem value="Australia">Australia</MenuItem>
                                    <MenuItem value="Germany">Germany</MenuItem>
                                    <MenuItem value="Ireland">Ireland</MenuItem>
                                    <MenuItem value="New Zealand">New Zealand</MenuItem>
                                </TextField>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* DEBUGGER: Temporary for troubleshooting */}
            <Paper sx={{ p: 2, mt: 4, bgcolor: '#f1f5f9', border: '1px dashed #cbd5e1' }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    <strong>DEBUG INFO:</strong>
                    {'\n'}User ID: {formData.email ? 'Authenticated' : 'No User Found'}
                    {'\n'}Raw Data Check: {JSON.stringify(formData, null, 2)}
                </Typography>
            </Paper>

            <Snackbar
                open={!!notification}
                autoHideDuration={4000}
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={notification?.type as any} variant="filled" onClose={() => setNotification(null)}>
                    {notification?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProfilePage;
