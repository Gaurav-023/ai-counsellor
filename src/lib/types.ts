export interface University {
    id: string;
    name: string;
    location: string;
    country: string;
    ranking: number;
    acceptance_rate: number;
    cost_range: 'High' | 'Medium' | 'Low';
    logo_url?: string;
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
