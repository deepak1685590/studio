
"use client";

import { useEffect, useRef } from 'react';

// This hook is useful for preventing state updates on unmounted components,
// especially in async operations like the market scanner.
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};
