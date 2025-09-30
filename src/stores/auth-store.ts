import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "@/lib/api-client";
import { CaregiverProfile } from "@shared/types";
interface AuthState {
  isAuthenticated: boolean;
  user: CaregiverProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api<{ user: CaregiverProfile; token: string }>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          set({ 
            isAuthenticated: true, 
            user: response.user, 
            token: response.token, 
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
          set({ isAuthenticated: false, user: null, token: null, error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },
      logout: () => {
        set({ isAuthenticated: false, user: null, token: null, error: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);