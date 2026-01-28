import {
    Box,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import { Search01Icon, FilterHorizontalIcon } from 'hugeicons-react';
import type { FilterState } from '../hooks/useUniversities';

interface UniFiltersProps {
    filters: FilterState;
    onChange: (key: keyof FilterState, value: string) => void;
}

const COMMON_STYLES = {
    borderRadius: 2,
    bgcolor: '#f8fafc',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '1px solid #cbd5e1' },
    height: 48
};

const COUNTRIES = ["All", "United States", "United Kingdom", "Canada", "Australia", "Germany", "India", "Singapore", "France"];
const INTAKES = ["All", "Fall 2025", "Spring 2026", "Summer 2026"];
const GRADUATION = ["All", "Undergraduate", "Postgraduate", "PhD"];
const BUDGETS = ["All", "< 20k", "20k - 40k", "> 40k"];

export const UniFilters = ({ filters, onChange }: UniFiltersProps) => {
    return (
        <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 4, border: '1px solid #f1f5f9' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterHorizontalIcon size={20} color="#64748b" />
                <Typography variant="subtitle2" fontWeight="700" color="#64748b" sx={{ ml: 1 }}>
                    FILTERS
                </Typography>
            </Box>

            {/* Dynamic Filter Summary */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="#334155" fontWeight={600}>
                    {filters.country === 'All' &&
                        filters.budget === 'All' &&
                        filters.type === 'All' &&
                        filters.graduation === 'All' &&
                        filters.intake === 'All' &&
                        !filters.search
                        ? 'Showing all universities'
                        : 'Filtered by:'}
                </Typography>
                <Typography variant="body2" color="#475569" sx={{ mt: 0.5 }}>
                    {filters.search && <>Search: "<strong>{filters.search}</strong>" </>}
                    {filters.country !== 'All' && <> | Country: <strong>{filters.country}</strong></>}
                    {filters.budget !== 'All' && <> | Budget: <strong>{filters.budget}</strong></>}
                    {filters.type !== 'All' && <> | Type: <strong>{filters.type}</strong></>}
                    {filters.graduation !== 'All' && <> | Degree: <strong>{filters.graduation}</strong></>}
                    {filters.intake !== 'All' && <> | Intake: <strong>{filters.intake}</strong></>}
                </Typography>
            </Box>

            {/* Filters Grid */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="#64748b" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                        Search
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Search by name..."
                        value={filters.search}
                        onChange={(e) => onChange('search', e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search01Icon size={20} color="#94a3b8" />
                                </InputAdornment>
                            ),
                            sx: COMMON_STYLES
                        }}
                    />
                </Grid>

                <Grid item xs={6} sm={6} md={2}>
                    <Typography variant="caption" color="#64748b" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                        Country
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={filters.country}
                            onChange={(e) => onChange('country', e.target.value)}
                            displayEmpty
                            sx={COMMON_STYLES}
                        >
                            {COUNTRIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={6} sm={4} md={1.5}>
                    <Typography variant="caption" color="#64748b" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                        Budget
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={filters.budget}
                            onChange={(e) => onChange('budget', e.target.value)}
                            displayEmpty
                            sx={COMMON_STYLES}
                        >
                            {BUDGETS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={6} sm={4} md={1.5}>
                    <Typography variant="caption" color="#64748b" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                        Degree
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={filters.graduation}
                            onChange={(e) => onChange('graduation', e.target.value)}
                            displayEmpty
                            sx={COMMON_STYLES}
                        >
                            {GRADUATION.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={6} sm={4} md={1.5}>
                    <Typography variant="caption" color="#64748b" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                        Intake
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            value={filters.intake}
                            onChange={(e) => onChange('intake', e.target.value)}
                            displayEmpty
                            sx={COMMON_STYLES}
                        >
                            {INTAKES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>
    );
};