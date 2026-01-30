export interface University {
    id: string;
    name: string;
    location: string;
    country: string;
    ranking: number;
    acceptance_rate: number;
    cost_range: 'High' | 'Medium' | 'Low';
    tuition_fee?: number; // Added for precise budget filtering
    ai_classification?: 'Dream' | 'Target' | 'Safe'; // Added for AI recommendations
    fit_reason?: string; // AI generated reason
    risks?: string; // AI generated risks
    logo_url?: string;
    banner_url?: string;
    website_url?: string;
    degree_levels?: string[];
    tags: string[];
}

export interface ShortlistItem {
    id: string;
    user_id: string;
    university_id: string;
    university?: University; // Joined data
    category: 'Dream' | 'Target' | 'Safe';
    status: 'Shortlisted' | 'Locked';
    notes?: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface StudentProfile {
    id: string;
    preferred_countries?: string[];
    // Add other fields if needed, but for now we only need preferred_countries for search
    education_level?: string;
    degree_major?: string;
    gpa?: string;
}
