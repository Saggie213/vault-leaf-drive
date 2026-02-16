import { useActor } from './useActor';
import { useState, useEffect } from 'react';

export interface DriveActorState {
  actor: any | null;
  isInitializing: boolean;
  isReady: boolean;
  initError: Error | null;
  initWarning: string | null;
  retry: () => void;
}

/**
 * Resilient actor hook that handles initialization failures gracefully
 * and provides clear state signals for UI rendering decisions
 */
export function useDriveActor(): DriveActorState {
  const { actor, isFetching } = useActor();
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [initWarning, setInitWarning] = useState<string | null>(null);

  // Reset warning when actor changes
  useEffect(() => {
    if (actor) {
      setInitWarning(null);
    }
  }, [actor]);

  const retry = () => {
    setRetryTrigger((prev) => prev + 1);
    setInitWarning(null);
    // Force actor re-initialization by clearing and refetching
    window.location.reload();
  };

  // Determine if we're still initializing
  const isInitializing = isFetching && !actor;

  // Actor is ready when it exists and we're not fetching
  const isReady = !!actor && !isFetching;

  return {
    actor,
    isInitializing,
    isReady,
    initError: null, // We'll handle errors through React Query error states
    initWarning,
    retry,
  };
}
