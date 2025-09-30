import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
type DutyStatus = 'clocked-out' | 'clocking-in' | 'clocked-in' | 'clocking-out' | 'error';
interface DutyState {
  status: DutyStatus;
  startTime: string | null;
  error: string | null;
  initiateClockIn: (coords: GeolocationCoordinates) => void;
  clockOut: () => Promise<void>;
}
export const useDutyStore = create<DutyState>()(
  persist(
    (set, get) => ({
      status: 'clocked-out',
      startTime: null,
      error: null,
      initiateClockIn: async (coords) => {
        set({ status: 'clocking-in', error: null });
        try {
          const response = await api<{ status: string; startTime: string }>('/api/duty/clock-in', {
            method: 'POST',
            body: JSON.stringify({
              latitude: coords.latitude,
              longitude: coords.longitude,
            }),
          });
          set({ status: 'clocked-in', startTime: response.startTime });
          toast.success('Clocked in successfully!', {
            description: `Your shift started at ${new Date(response.startTime).toLocaleTimeString()}.`,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          set({ status: 'error', error: errorMessage });
          toast.error('Clock-in failed', { description: errorMessage });
        }
      },
      clockOut: async () => {
        set({ status: 'clocking-out', error: null });
        try {
          await api('/api/duty/clock-out', { method: 'POST' });
          set({ status: 'clocked-out', startTime: null });
          toast.info('You have been clocked out.');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          set({ status: 'error', error: errorMessage });
          toast.error('Clock-out failed', { description: errorMessage });
        }
      },
    }),
    {
      name: 'duty-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);