import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "LECTURER" | "STUDENT";
  studentId?: string;
}

interface AppState {
  // Auth state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // App state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Error state
  error: {
    message: string;
    code?: string;
  } | null;
  setError: (error: { message: string; code?: string } | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial Auth state
      user: null,
      setUser: (user) => set({ user }),
      
      // Initial UI state
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      
      // Initial App state
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Initial Error state
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: "attendscan-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // Only persist user info
    }
  )
);
