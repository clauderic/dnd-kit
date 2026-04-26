import {useCallback, useState} from 'react';

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState('');
  const announce = useCallback((value: string | undefined) => {
    if (value != null) {
      // Clear the announcement first to ensure screen readers detect the change
      // even when the same text is announced consecutively
      setAnnouncement('');
      // Use requestAnimationFrame to ensure the clear renders before setting new value
      requestAnimationFrame(() => {
        setAnnouncement(value);
      });
    }
  }, []);

  return {announce, announcement} as const;
}
