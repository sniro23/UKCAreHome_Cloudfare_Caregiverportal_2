import { useState, useCallback } from 'react';
interface GeolocationState {
  isLoading: boolean;
  position: GeolocationPosition | null;
  error: GeolocationPositionError | Error | null;
}
export const useGeolocation = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    isLoading: false,
    position: null,
    error: null,
  });
  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        error: new Error('Geolocation is not supported by your browser.'),
      }));
      return;
    }
    setState((s) => ({ ...s, isLoading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          isLoading: false,
          position,
          error: null,
        });
      },
      (error) => {
        setState({
          isLoading: false,
          position: null,
          error,
        });
      },
      options
    );
  }, [options]);
  return { ...state, getPosition };
};