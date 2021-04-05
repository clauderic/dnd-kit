import {useCallback, useState} from 'react';

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState('');
  const announce = useCallback((value: string | undefined) => {
    if (value != null) {
      setAnnouncement(value);
    }
  }, []);

  return {announce, announcement} as const;
}
