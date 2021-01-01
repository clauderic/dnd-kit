import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

const timeout = 1e3; // 1 second

export function useAnnouncement() {
  const [announcementMap, setAnnouncements] = useState(
    new Map<NodeJS.Timeout, string>()
  );
  const announce = useCallback((announcement: string) => {
    setAnnouncements((announcements) => {
      const timeoutId = setTimeout(() => {
        setAnnouncements((announcements) => {
          announcements.delete(timeoutId);

          return new Map(announcements);
        });
      }, timeout);

      announcements.set(timeoutId, announcement);

      return new Map(announcements);
    });
  }, []);
  const announcementMapRef = useRef(announcementMap);
  const entries = useMemo(() => Array.from(announcementMap.entries()), [
    announcementMap,
  ]);

  useEffect(() => {
    announcementMapRef.current = announcementMap;
  }, [announcementMap]);

  useEffect(() => {
    return () => {
      // Clean up any queued `setTimeout` calls on unmount
      // eslint-disable-next-line react-hooks/exhaustive-deps
      announcementMapRef.current.forEach((_, key) => {
        clearTimeout(key);
      });
    };
  }, []);

  return {announce, entries} as const;
}
