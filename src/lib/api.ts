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

// --- Profile Management ---

export const updateStudentProfile = async (updates: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('student_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

    if (error) throw error;
    return data;
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
