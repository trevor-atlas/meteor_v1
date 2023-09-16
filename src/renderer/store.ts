import create from 'zustand';
import { BrowserHistory } from '../types';

interface HistoryStore {
  history: BrowserHistory[];
  selectedRow: number;
  query: string;
  updateHistory: (newHistory: BrowserHistory[]) => void;
  setSelectedRow: (row: number) => void;
  incrementSelectedRow: () => void;
  decrementSelectedRow: () => void;
  setQuery: (query: string) => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  history: [],
  selectedRow: 0,
  query: '',

  updateHistory: (newHistory: BrowserHistory[]) =>
    set((state) => ({ history: newHistory })),
  setSelectedRow: (row: number) => set((state) => ({ selectedRow: row })),
  decrementSelectedRow: () =>
    set((state) => {
      if (state.selectedRow - 1 < 0) {
        return { selectedRow: 9 };
      }
      return { selectedRow: state.selectedRow - 1 };
    }),
  incrementSelectedRow: () =>
    set((state) => {
      if (state.selectedRow + 1 > 9) {
        return { selectedRow: 0 };
      }
      return { selectedRow: state.selectedRow + 1 };
    }),
  setQuery: (query: string) => set((state) => ({ query })),
}));
