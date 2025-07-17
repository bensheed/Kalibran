import { create } from 'zustand';

interface TestState {
    value: string | null;
    setValue: (value: string) => void;
}

export const useTestStore = create<TestState>((set, get) => {
    console.log('[TEST_STORE] Creating store, set type:', typeof set, 'get type:', typeof get);
    
    return {
        value: null,
        setValue: (value: string) => {
            console.log('[TEST_STORE] setValue called with:', value);
            console.log('[TEST_STORE] set type in setValue:', typeof set);
            
            try {
                set({ value });
                console.log('[TEST_STORE] set call completed, new state:', get());
            } catch (error) {
                console.error('[TEST_STORE] Error in setValue:', error);
                throw error;
            }
        }
    };
});