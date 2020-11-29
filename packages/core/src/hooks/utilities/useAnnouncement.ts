import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLatest} from '@dnd-kit/utilities';

interface Arguments {
  timeout: number;
}

const defaultArguments: Arguments = {
  timeout: 5e3, // 5 seconds
};

export function useAnnouncement({timeout} = defaultArguments) {
  const [announcementMap, setAnnouncements] = useState(
    new Map<NodeJS.Timeout, string>()
  );
  const announce = useCallback(
    (announcement: string) => {
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
    },
    [timeout]
  );
  const announcementMapRef = useLatest(announcementMap);
  const announcements = useMemo(() => Array.from(announcementMap.values()), [
    announcementMap,
  ]);

  useEffect(
    () => {
      return () => {
        // Clean up any queued `setTimeout` calls on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
        announcementMapRef.current.forEach((_, key) => {
          clearTimeout(key);
        });
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {announce, announcements} as const;
}
