import { useCallback, useEffect, useRef, useState } from 'react';

export function useDelayedDropdown(delay = 350) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const open = useCallback(() => {
    cancelClose();
    setIsOpen(true);
  }, [cancelClose]);

  const close = useCallback(() => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, delay);
  }, [cancelClose, delay]);

  useEffect(() => cancelClose, [cancelClose]);

  return { isOpen, open, close, cancelClose };
}

