import { create } from 'zustand';
import api from '../services/api';
import { Board } from '../models/Board';
import { Column } from '../models/Column';
import { Card } from '../models/Card';

interface BoardState {
    boards: Board[];
    selectedBoard: Board | null;
    columns: Column[];
    cards: Card[];
    loading: boolean;
    error: string | null;
    settings: any;
    fetchBoards: () => Promise<void>;
    fetchBoardById: (id: number) => Promise<void>;
    moveCard: (job_no: string, new_column_id: number, inst_id: number) => Promise<void>;
    fetchSettings: () => Promise<void>;
}

export const useBoardStore = create<BoardState>((set) => ({
    boards: [],
    selectedBoard: null,
    columns: [],
    cards: [],
    loading: false,
    error: null,
    settings: {},
    fetchBoards: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/boards');
            set({ boards: response.data, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch boards', loading: false });
        }
    },
    fetchBoardById: async (id: number) => {
        console.log('[BOARD_STORE] Fetching board with ID:', id);
        set({ loading: true, error: null });
        try {
            console.log('[BOARD_STORE] Making API request to /boards/' + id);
            const response = await api.get(`/boards/${id}`);
            console.log('[BOARD_STORE] API response received:', response.data);
            set({
                selectedBoard: response.data,
                columns: response.data.columns || [],
                cards: response.data.cards || [],
                loading: false,
            });
            console.log('[BOARD_STORE] Board data set successfully');
        } catch (error: any) {
            console.error('[BOARD_STORE] Error fetching board:', error);
            console.error('[BOARD_STORE] Error response:', error.response?.data);
            console.error('[BOARD_STORE] Error status:', error.response?.status);
            set({ error: 'Failed to fetch board', loading: false });
        }
    },
    moveCard: async (job_no: string, new_column_id: number, inst_id: number) => {
        try {
            await api.put(`/cards/${job_no}/move`, { new_column_id, inst_id });
            // After moving the card, we need to refetch the board data to get the updated state
            set((state) => {
                if (state.selectedBoard) {
                    state.fetchBoardById(state.selectedBoard.id);
                }
                return state;
            });
        } catch (error) {
            set({ error: 'Failed to move card' });
        }
    },
    fetchSettings: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/settings');
            set({ settings: response.data, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch settings', loading: false });
        }
    },
}));
