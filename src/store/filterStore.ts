import { create } from 'zustand';

interface FilterState {
    chatFilters: {
        country: string | null;
        budget: string | null;
        intake: string | null;
    };
    setChatFilters: (filters: { country?: string; budget?: string; intake?: string }) => void;
    clearChatFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    chatFilters: {
        country: null,
        budget: null,
        intake: null
    },
    setChatFilters: (filters) => set((state) => ({
        chatFilters: { ...state.chatFilters, ...filters }
    })),
    clearChatFilters: () => set({
        chatFilters: { country: null, budget: null, intake: null }
    })
}));
