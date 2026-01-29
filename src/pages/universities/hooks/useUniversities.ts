import { useState, useEffect } from 'react';
import { getUniversities, getShortlist, addToShortlist, removeFromShortlist, updateShortlistStatus, getStudentProfile, searchUniversities } from '../../../lib/api';
import type { University, ShortlistItem } from '../../../lib/types';
import { events } from '../../../lib/events';

export interface FilterState {
    search: string;
    country: string;
    intake: string;
    graduation: string; // Restoring graduation
    budget: string;
}

const mapBudgetToFilter = (budgetRange?: string) => {
    if (!budgetRange) return 'All';
    const b = budgetRange.toLowerCase().trim();
    if (b.includes('under') && b.includes('20')) return '< 20k';
    if (b === 'under_20k') return '< 20k';
    if (b === '< 20k') return '< 20k';

    if (b.includes('20') && b.includes('40')) return '20k - 40k';
    if (b === '20k_40k') return '20k - 40k';

    if (b.includes('40') || b.includes('60') || b === '60k_plus') return '> 40k';

    return 'All';
};

export const useUniversities = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        country: 'All',
        intake: 'All',
        graduation: 'All',
        budget: 'All'
    });

    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Stable Random Generator based on string seed
    const pseudoRandom = (seed: string) => {
        let value = 0;
        for (let i = 0; i < seed.length; i++) {
            value = (value * 31 + seed.charCodeAt(i)) % 10000;
        }
        return value / 10000;
    };

    const augmentUniversityData = (uni: University, profile: any): University => {
        const rand = pseudoRandom(uni.name + uni.country);

        // Simulate Tuition: $15,000 to $65,000
        const tuition_fee = uni.tuition_fee || Math.floor(15000 + (rand * 50000));

        // Simulate Acceptance: 10% to 90%
        const acceptance_rate = uni.acceptance_rate || (0.1 + (pseudoRandom(uni.name + 'acc') * 0.8));

        // Simulate Ranking: 1 to 1000
        const ranking = uni.ranking || Math.floor(1 + (pseudoRandom(uni.name + 'rank') * 1000));

        // --- DYNAMIC AI CLASSIFICATION ---
        let ai_classification = uni.ai_classification;

        // Only calculate if not already set (e.g. from shortlist) AND we have profile data
        if (!ai_classification && profile) {
            // Normalize GPA (Assuming 4.0 scale if < 5, else assume percentage/10)
            let userGpa = 3.0; // Default
            // Check if profile.gpa exists before calling toString to prevent "undefined is not an object" error
            const gpaStr = profile.gpa ? profile.gpa.toString() : '';
            const gpaVal = parseFloat(gpaStr.split('/')[0]);

            if (!isNaN(gpaVal)) {
                if (gpaVal <= 4.0) userGpa = gpaVal;
                else if (gpaVal <= 10.0) userGpa = gpaVal * 0.4; // Convert 10 scale to 4
                else userGpa = (gpaVal / 100) * 4.0; // Convert 100 scale to 4
            }

            // Simple Heuristic
            // High GPA (3.8+) + High Acceptance (>60%) -> Safe
            // Low GPA (<3.0) + Low Acceptance (<30%) -> Dream

            const difficulty = 1 - acceptance_rate; // 0.9 (Hard) to 0.1 (Easy)
            const studentScore = userGpa / 4.0; // 0.0 to 1.0

            const gap = studentScore - difficulty;

            if (gap > 0.2) ai_classification = 'Safe';
            else if (gap < -0.1) ai_classification = 'Dream';
            else ai_classification = 'Target';
        } else if (!ai_classification) {
            // Fallback if no profile
            if (acceptance_rate < 0.3) ai_classification = 'Dream';
            else if (acceptance_rate > 0.6) ai_classification = 'Safe';
            else ai_classification = 'Target';
        }

        // --- NEW: Mock AI Evaluation Data ---
        // customize these based on profile if possible
        const fit_reasons = [
            "Strong match for your academic profile and budget.",
            "Excellent Computer Science department suitable for your goals.",
            "Located in a tech hub with great internship opportunities.",
            "Offers the specific specialization you are looking for.",
            "Generous scholarship opportunities for international students."
        ];
        const risk_factors = [
            "High cost of living in this city.",
            "Very competitive acceptance rate.",
            "Limited on-campus housing availability.",
            "Requires higher GPA than your current profile.",
            "Cold climate might be challenging."
        ];

        const fit_reason = uni.fit_reason || fit_reasons[Math.floor(pseudoRandom(uni.name + 'fit') * fit_reasons.length)];
        const risks = uni.risks || risk_factors[Math.floor(pseudoRandom(uni.name + 'risk') * risk_factors.length)];

        return {
            ...uni,
            ranking,
            acceptance_rate,
            tuition_fee,
            ai_classification,
            fit_reason,
            risks,
            cost_range: tuition_fee > 45000 ? 'High' : tuition_fee > 25000 ? 'Medium' : 'Low'
        };
        // --- TYPE & INTAKE ALIGNMENT ---
        let tags = uni.tags ? [...uni.tags] : [];

        // Ensure Degree Type matches profile if not already specific
        // Determine intended degree type from profile
        const degreeType = profile?.intended_degree?.toLowerCase().includes('master') ||
            profile?.intended_degree?.toLowerCase().includes('phd') ||
            profile?.intended_degree?.toLowerCase().includes('mba')
            ? 'Postgraduate'
            : 'Undergraduate';

        // Add the tag if not present
        if (!tags.includes('Undergraduate') && !tags.includes('Postgraduate')) {
            tags.push(degreeType);
        }

        // Intake: Prefer Fall as requested, or randomize appropriately
        // We don't have a specific field for intake in University type yet, but we can simulate it in fit_reason or add it if needed. 
        // For now, let's assume valid intake is mostly Fall for international students.

        return {
            ...uni,
            ranking,
            acceptance_rate,
            tuition_fee,
            ai_classification,
            fit_reason,
            risks,
            tags,
            cost_range: tuition_fee > 45000 ? 'High' : tuition_fee > 25000 ? 'Medium' : 'Low'
        };
    };

    const loadData = async (countryOverride?: string) => {
        try {
            setLoading(true);

            // 1. Get Dependencies
            const [profile, list] = await Promise.all([getStudentProfile(), getShortlist()]);
            setShortlist(list);

            // 2. Check Global Store Overrides (Chat Intent) - ALWAYS CHECK THIS FIRST
            const { chatFilters } = await import('../../../store/filterStore').then(m => m.useFilterStore.getState());

            // Calculate Effective Filters
            let effectiveFilters = { ...filters };

            // Apply Country Override from Arg or Chat
            if (chatFilters.country) {
                effectiveFilters.country = chatFilters.country;
            } else if (countryOverride) {
                effectiveFilters.country = countryOverride;
            }

            // Apply Chat Filters
            if (chatFilters.budget) effectiveFilters.budget = mapBudgetToFilter(chatFilters.budget);
            if (chatFilters.intake) effectiveFilters.intake = chatFilters.intake;

            // Apply Profile Defaults (Smart Fill)
            const isDefaultState = filters.country === 'All' && filters.budget === 'All' && filters.graduation === 'All' && !chatFilters.country;

            if (isDefaultState && profile) {
                // 1. Country: Pick first preference
                if (profile.preferred_countries && profile.preferred_countries.length > 0) {
                    effectiveFilters.country = profile.preferred_countries[0];
                }

                // 2. Budget: Map range
                if (profile.budget_range) {
                    effectiveFilters.budget = mapBudgetToFilter(profile.budget_range);
                }

                // 3. Degree: Map Intended Degree to Undergraduate/Postgraduate
                if (profile.intended_degree) {
                    const deg = profile.intended_degree.toLowerCase();
                    if (deg.includes('master') || deg.includes('phd') || deg.includes('mba')) {
                        effectiveFilters.graduation = 'Postgraduate';
                    } else if (deg.includes('bachelor') || deg.includes('undergrad')) {
                        effectiveFilters.graduation = 'Undergraduate';
                    }
                }
            }

            // Update State if Changed
            const hasChanged =
                filters.country !== effectiveFilters.country ||
                filters.budget !== effectiveFilters.budget ||
                filters.graduation !== effectiveFilters.graduation || // Added graduation check
                filters.intake !== effectiveFilters.intake;

            if (hasChanged) {
                setFilters(effectiveFilters);
            }

            // 3. Fetch Data
            let unis: University[] = [];
            const countryToFetch = effectiveFilters.country;

            if (countryToFetch === 'All') {
                unis = await getUniversities();
            } else {
                unis = await searchUniversities(countryToFetch);
            }

            const augmented = unis.map(u => augmentUniversityData(u, profile));
            setUniversities(augmented);

        } catch (err: any) {
            console.error("Load Data Error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();

        // Listen for global events (triggered by Chat Intent)
        const unsubscribe = events.subscribe(() => {
            console.log("Global Event Received in usageUniversities: Reloading Data with potential new filters");
            loadData(); // Re-run load data which checks the store
        });

        return () => { unsubscribe(); };
    }, []);

    const handleFilterChange = async (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);

        // SYNC: Update global store so it doesn't override manual selection on next reload
        if (key === 'country' || key === 'budget' || key === 'intake') {
            const { useFilterStore } = await import('../../../store/filterStore');
            const storeUpdate: any = {};
            storeUpdate[key] = value === 'All' ? null : value;
            useFilterStore.getState().setChatFilters(storeUpdate);
        }

        if (key === 'country') {
            loadData(value);
        }
    };

    const handleShortlist = async (uniId: string, category: 'Dream' | 'Target' | 'Safe') => {
        try {
            let finalId = uniId;

            // Handle Hipo (External) IDs
            if (uniId.startsWith('hipo-')) {
                const uni = universities.find(u => u.id === uniId);
                if (!uni) throw new Error("University data not found for valid ID generation");

                // Materialize the university in the DB to get a UUID
                finalId = await import('../../../lib/api').then(m => m.ensureUniversityExists(uni));
            }

            const newItem = await addToShortlist(finalId, category);

            // Manual State Update (No Re-fetch)
            // We need to construct the full object with the university data for the UI
            let uniData = universities.find(u => u.id === uniId);

            // Special handling for Hipo universities if we just created them
            if (!uniData && finalId !== uniId) {
                // We don't have the new generated ID in our local universities list easily available mapped to the Hipo ID
                // But we can try to find it by name/country or just re-fetch to be safe in this edge case
                const list = await getShortlist(); // Fallback for Hipo edge case
                setShortlist(list);
                return;
            }

            if (uniData) {
                const newShortlistItem: ShortlistItem = {
                    ...newItem,
                    university: uniData
                };
                setShortlist(prev => [newShortlistItem, ...prev]);
            } else {
                // Fallback if we can't find local uni data (shouldn't happen for normal flow)
                const list = await getShortlist();
                setShortlist(list);
            }

        } catch (err: any) {
            console.error(err);
            alert('Could not shortlist: ' + err.message);
        }
    };

    const handleRemove = async (universityId: string) => {
        const itemToRemove = shortlist.find(item => item.university_id === universityId);

        if (!itemToRemove) {
            console.warn("Attempted to remove item not in local shortlist state", universityId);
            return;
        }

        if (!confirm('Remove from shortlist?')) return;

        // Optimistic Update: Remove immediately
        const previousShortlist = [...shortlist];
        setShortlist(prev => prev.filter(item => item.id !== itemToRemove.id));

        try {
            await removeFromShortlist(itemToRemove.id);
            // Success - no need to do anything else, or optionally background refresh
            // getShortlist().then(setShortlist); 
        } catch (err) {
            console.error(err);
            setShortlist(previousShortlist); // Revert
            alert("Failed to remove from shortlist. Please try again.");
        }
    };

    // --- NEW: Locking Logic ---
    const handleLock = async (shortlistId: string) => {
        // Optimistic Update
        const previousShortlist = [...shortlist];
        setShortlist(prev => prev.map(item =>
            item.id === shortlistId ? { ...item, status: 'Locked' as const } : item
        ));

        try {
            await updateShortlistStatus(shortlistId, 'Locked');
        } catch (err: any) {
            setShortlist(previousShortlist); // Revert
            alert("Could not lock: " + err.message);
        }
    };

    const handleUnlock = async (shortlistId: string) => {
        // Optimistic Update
        const previousShortlist = [...shortlist];
        setShortlist(prev => prev.map(item =>
            item.id === shortlistId ? { ...item, status: 'Shortlisted' as const } : item
        ));

        try {
            await updateShortlistStatus(shortlistId, 'Shortlisted');
        } catch (err: any) {
            setShortlist(previousShortlist); // Revert
            alert("Could not unlock: " + err.message);
        }
    };

    // Filter Logic
    const filteredUniversities = universities.filter(u => {
        const query = filters.search.toLowerCase();
        const matchesSearch = u.name.toLowerCase().includes(query) ||
            u.location.toLowerCase().includes(query);

        // Degree/Graduation Filter
        const matchesGraduation = filters.graduation === 'All' ? true : (u.tags?.includes(filters.graduation) ?? true);

        // Budget Filter
        let matchesBudget = true;
        if (filters.budget !== 'All') {
            const fee = u.tuition_fee;
            if (fee) {
                if (filters.budget === '< 20k') matchesBudget = fee < 20000;
                else if (filters.budget === '20k - 40k') matchesBudget = fee >= 20000 && fee <= 40000;
                else if (filters.budget === '> 40k') matchesBudget = fee > 40000;
            }
        }

        return matchesSearch && matchesGraduation && matchesBudget;
    });

    const paginatedUniversities = filteredUniversities.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE);

    return {
        universities: paginatedUniversities,
        totalUniversities: filteredUniversities.length,
        shortlist,
        loading,
        error,
        filters,
        page,
        totalPages,
        setPage,
        handleFilterChange,
        handleShortlist,
        handleRemove,
        handleLock,   // Exported
        handleUnlock  // Exported
    };
};
