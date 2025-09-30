import { create } from 'zustand';
import { RosterShift, ShiftRequest } from '@shared/types';
import { api } from '@/lib/api-client';
interface RosterState {
  shifts: RosterShift[];
  isLoading: boolean;
  error: string | null;
  fetchShifts: () => Promise<void>;
  shiftRequests: ShiftRequest[];
  isLoadingRequests: boolean;
  fetchShiftRequests: () => Promise<void>;
  submitShiftRequest: (shiftId: string, reason: string) => Promise<void>;
}
export const useRosterStore = create<RosterState>((set, get) => ({
  shifts: [],
  isLoading: false,
  error: null,
  fetchShifts: async () => {
    set({ isLoading: true, error: null });
    try {
      const shifts = await api<RosterShift[]>('/api/roster');
      set({ shifts, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shifts';
      set({ isLoading: false, error: errorMessage });
    }
  },
  shiftRequests: [],
  isLoadingRequests: false,
  fetchShiftRequests: async () => {
    set({ isLoadingRequests: true });
    try {
      const requests = await api<ShiftRequest[]>('/api/roster/requests');
      set({ shiftRequests: requests, isLoadingRequests: false });
    } catch (error) {
      console.error("Failed to fetch shift requests:", error);
      set({ isLoadingRequests: false });
    }
  },
  submitShiftRequest: async (shiftId: string, reason: string) => {
    const newRequest = await api<ShiftRequest>('/api/roster/requests', {
      method: 'POST',
      body: JSON.stringify({ shiftId, reason }),
    });
    set(state => ({
      shiftRequests: [...state.shiftRequests, newRequest],
    }));
  },
}));