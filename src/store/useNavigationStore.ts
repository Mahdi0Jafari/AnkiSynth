import { create } from 'zustand';

interface NavigationState {
  activeDeckId: number | null;
  setActiveDeckId: (id: number | null) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeDeckId: null, // null = در حال ساخت یک دک جدید (بدون وابستگی)
  setActiveDeckId: (id) => set({ activeDeckId: id }),
}));