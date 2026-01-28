import { useState, useEffect } from 'react';
import { getUniversities, getShortlist, addToShortlist, removeFromShortlist, updateShortlistStatus, getStudentProfile, searchUniversities } from '../../../lib/api';
import type { University, ShortlistItem } from '../../../lib/types';

export interface FilterState {
    search: string;
    country: string;
    type: string;
    intake: string;
    graduation: string;
    budget: string;
}

export const useUniversities = () => {
    const [universities, setUniversities] = useState<University[]>([]);
    const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        country: 'All',
        type: 'All',
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

    const augmentUniversityData = (uni: University): University => {
        const rand = pseudoRandom(uni.name + uni.country);

        // Simulate Tuition: $15,000 to $65,000
        const tuition_fee = uni.tuition_fee || Math.floor(15000 + (rand * 50000));

        // Simulate Acceptance: 10% to 90%
        const acceptance_rate = uni.acceptance_rate || (0.1 + (pseudoRandom(uni.name + 'acc') * 0.8));

        // Simulate Ranking: 1 to 1000
        const ranking = uni.ranking || Math.floor(1 + (pseudoRandom(uni.name + 'rank') * 1000));

        // AI Classification based on acceptance
        let ai_classification = uni.ai_classification;
        if (!ai_classification) {
            if (acceptance_rate < 0.3) ai_classification = 'Dream';
            else if (acceptance_rate > 0.6) ai_classification = 'Safe';
            else ai_classification = 'Target';
        }

        // --- NEW: Mock AI Evaluation Data ---
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
    };

    const loadData = async (countryOverride?: string) => {
        try {
            setLoading(true);
            const [profile, list] = await Promise.all([getStudentProfile(), getShortlist()]);
            setShortlist(list);

            let unis: University[] = [];
            const countryToCheck = countryOverride || filters.country;

            if (countryToCheck === 'All') {
                unis = await getUniversities();
                if (unis.length === 0 && profile?.preferred_countries?.[0]) {
                    const pref = profile.preferred_countries[0];
                    setFilters(prev => ({ ...prev, country: pref }));
                    unis = await searchUniversities(pref);
                }
            } else {
                unis = await searchUniversities(countryToCheck);
            }

            const augmented = unis.map(augmentUniversityData);
            setUniversities(augmented);
        } catch (err: any) {
            console.error("Load Data Error", err);
            // setError(err.message || 'Failed to load data'); // Suppress for smoother demo
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
        if (key === 'country') {
            loadData(value);
        }
    };

    const handleShortlist = async (uniId: string, category: 'Dream' | 'Target' | 'Safe') => {
        try {
            await addToShortlist(uniId, category);
            const newList = await getShortlist();
            setShortlist(newList);
        } catch (err: any) {
            alert('Could not shortlist: ' + err.message);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove from shortlist?')) return;
        try {
            await removeFromShortlist(id);
            const newList = await getShortlist();
            setShortlist(newList);
        } catch (err) { console.error(err); }
    };

    // --- NEW: Locking Logic ---
    const handleLock = async (shortlistId: string) => {
        if (!confirm('Lock this university? This will unlock application guidance.')) return;
        try {
            await updateShortlistStatus(shortlistId, 'Locked');
            const newList = await getShortlist();
            setShortlist(newList);
        } catch (err: any) {
            alert("Could not lock: " + err.message);
        }
    };

    const handleUnlock = async (shortlistId: string) => {
        if (!confirm('Unlock this university? You will lose access to specific guidance.')) return;
        try {
            await updateShortlistStatus(shortlistId, 'Shortlisted');
            const newList = await getShortlist();
            setShortlist(newList);
        } catch (err: any) {
            alert("Could not unlock: " + err.message);
        }
    };

    // Filter Logic
    const filteredUniversities = universities.filter(u => {
        const query = filters.search.toLowerCase();
        const matchesSearch = u.name.toLowerCase().includes(query) ||
            u.location.toLowerCase().includes(query);

        const matchesType = filters.type === 'All' ? true : (u.tags?.includes(filters.type) ?? true);

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

        return matchesSearch && matchesType && matchesBudget;
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
