"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBoardStore = void 0;
const zustand_1 = require("zustand");
const api_1 = __importDefault(require("../services/api"));
exports.useBoardStore = (0, zustand_1.create)((set) => ({
    boards: [],
    selectedBoard: null,
    columns: [],
    cards: [],
    loading: false,
    error: null,
    settings: {},
    fetchBoards: () => __awaiter(void 0, void 0, void 0, function* () {
        set({ loading: true, error: null });
        try {
            const response = yield api_1.default.get('/boards');
            set({ boards: response.data, loading: false });
        }
        catch (error) {
            set({ error: 'Failed to fetch boards', loading: false });
        }
    }),
    fetchBoardById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        set({ loading: true, error: null });
        try {
            const response = yield api_1.default.get(`/boards/${id}`);
            set({
                selectedBoard: response.data,
                columns: response.data.columns,
                cards: response.data.cards,
                loading: false,
            });
        }
        catch (error) {
            set({ error: 'Failed to fetch board', loading: false });
        }
    }),
    moveCard: (job_no, new_column_id, inst_id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield api_1.default.put(`/cards/${job_no}/move`, { new_column_id, inst_id });
            // After moving the card, we need to refetch the board data to get the updated state
            set((state) => {
                if (state.selectedBoard) {
                    state.fetchBoardById(state.selectedBoard.id);
                }
                return state;
            });
        }
        catch (error) {
            set({ error: 'Failed to move card' });
        }
    }),
    fetchSettings: () => __awaiter(void 0, void 0, void 0, function* () {
        set({ loading: true, error: null });
        try {
            const response = yield api_1.default.get('/settings');
            set({ settings: response.data, loading: false });
        }
        catch (error) {
            set({ error: 'Failed to fetch settings', loading: false });
        }
    }),
}));
