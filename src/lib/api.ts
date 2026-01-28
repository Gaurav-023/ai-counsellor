import { supabase } from './supabase';
import type { University, ShortlistItem, ChatMessage } from './types';

// --- Universities ---

export const getUniversities = async (): Promise<University[]> => {
    const { data, error } = await supabase
        .from('universities')
        .select('*')
        .order('ranking', { ascending: true });

    if (error) throw error;
    return data as University[];
};

export const getUniversityById = async (id: string): Promise<University | null> => {
    const { data, error } = await supabase
        .from('universities')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as University;
};

export const getStudentProfile = async (): Promise<any> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch basic profile (name, etc.)
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
    
    if (profileError) console.error('Error fetching basic profile:', profileError);

    // Fetch student details
    const { data: studentData, error: studentError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (studentError && studentError.code !== 'PGRST116') {
        throw studentError;
    }

    // Merge data: precedence to studentData, but add full_name from profileData
    return {
        ...(studentData || {}),
        full_name: profileData?.full_name || ''
    };
};

export const searchUniversities = async (country: string): Promise<University[]> => {
    try {
        const response = await fetch(`http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`);
        if (!response.ok) throw new Error('Failed to fetch from Hipolabs API');

        const data = await response.json();

        // Transform to match University interface
        return data.slice(0, 500).map((u: any, index: number) => ({
            id: `hipo-${index}-${u.name.replace(/\s+/g, '-').toLowerCase()}`, // Generate a temporary ID
            name: u.name,
            location: u['state-province'] || u.country,
            country: u.country,
            ranking: 0, // Not available
            acceptance_rate: 0, // Not available
            cost_range: 'Medium', // Default
            tags: ['External'],
            logo_url: undefined
        }));
    } catch (err) {
        console.error("API Search Error:", err);
        return [];
    }
};

// --- Helper: Ensure University Exists (for Hipo/External IDs) ---
export const ensureUniversityExists = async (uni: University): Promise<string> => {
    // 1. Check if it already exists by name and country
    const { data: existing } = await supabase
        .from('universities')
        .select('id')
        .eq('name', uni.name)
        .eq('country', uni.country)
        .single();

    if (existing) return existing.id;

    // 2. If not, insert it
    const { data: newUni, error } = await supabase
        .from('universities')
        .insert({
            name: uni.name,
            location: uni.location,
            country: uni.country,
            ranking: uni.ranking || null, // API might return 0
            acceptance_rate: uni.acceptance_rate || null,
            cost_range: uni.cost_range || 'Medium',
            tags: ['External']
        })
        .select('id')
        .single();

    if (error) throw error;
    return newUni.id;
};

// --- Shortlist ---

export const getShortlist = async (): Promise<ShortlistItem[]> => {
    const { data, error } = await supabase
        .from('university_shortlist')
        .select('*, university:universities(*)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ShortlistItem[];
};

export const addToShortlist = async (universityId: string, category: 'Dream' | 'Target' | 'Safe') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('university_shortlist')
        .insert({
            user_id: user.id,
            university_id: universityId,
            category,
            status: 'Shortlisted'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateShortlistStatus = async (shortlistId: string, status: 'Shortlisted' | 'Locked') => {
    const { data, error } = await supabase
        .from('university_shortlist')
        .update({ status })
        .eq('id', shortlistId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const removeFromShortlist = async (shortlistId: string) => {
    const { error } = await supabase
        .from('university_shortlist')
        .delete()
        .eq('id', shortlistId);

    if (error) throw error;
};

// --- Tasks (To-Do List) ---

export interface Task {
    id: string;
    user_id: string;
    text: string;
    completed: boolean;
    created_at: string;
}

export const getTasks = async (): Promise<Task[]> => {
    const { data, error } = await supabase
        .from('student_tasks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Task[];
};

export const addTask = async (text: string): Promise<Task> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('student_tasks')
        .insert({
            user_id: user.id,
            text,
            completed: false
        })
        .select()
        .single();

    if (error) throw error;
    return data as Task;
};

export const updateTaskStatus = async (taskId: string, completed: boolean): Promise<Task> => {
    const { data, error } = await supabase
        .from('student_tasks')
        .update({ completed })
        .eq('id', taskId)
        .select()
        .single();
    if (error) throw error;
    return data as Task;
};

export const deleteTask = async (taskId: string): Promise<void> => {
    const { error } = await supabase
        .from('student_tasks')
        .delete()
        .eq('id', taskId);
    if (error) throw error;
};

// --- Profile Management ---

export const updateStudentProfile = async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { full_name, ...profileUpdates } = updates;

    // 1. Update Public Profile (full_name)
    if (full_name !== undefined) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ full_name })
            .eq('id', user.id);

        if (profileError) throw profileError;
    }

    // 2. Update Student Profile (Detailed Data)
    // Only proceed if there are other fields to update
    if (Object.keys(profileUpdates).length > 0) {
        // First check if a row exists, if not, we might need to upsert (though triggers usually create it)
        // But for update specifically:
        const { data, error } = await supabase
            .from('student_profiles')
            .upsert({ id: user.id, ...profileUpdates }) // Use upsert to be safe
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// --- AI Chat (Edge Function Integration) ---

export const getChatHistory = async (): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ChatMessage[];
};

export const clearChatHistory = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

    if (error) throw error;
};

export const sendMessageToAI = async (content: string): Promise<ChatMessage[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // 1. Save User Message
    const { data: userMsg, error: userError } = await supabase
        .from('chat_messages')
        .insert({ user_id: user.id, role: 'user', content })
        .select()
        .single();

    if (userError) throw userError;

    let aiResponseText = "";

    try {
        // 2. Invoke Edge Function
        // The SDK automatically attaches the Authorization header for the current session
        const { data, error } = await supabase.functions.invoke('chat-counsellor', {
            body: { message: content }
        });

        if (error) throw error;
        // The edge function should return { reply: "..." }
        aiResponseText = data?.reply || "I didn't receive a response from the server.";

    } catch (err: any) {
        console.error("Edge Function Error:", err);
        aiResponseText = "I'm having trouble connecting to my brain server. Please ensure the 'chat-counsellor' function is deployed and secrets are set.";
    }

    // 3. Save AI Response (or Error Message)
    const { data: aiMsg, error: aiError } = await supabase
        .from('chat_messages')
        .insert({ user_id: user.id, role: 'assistant', content: aiResponseText })
        .select()
        .single();

    if (aiError) throw aiError;

    return [userMsg, aiMsg];
};
