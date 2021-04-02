import {useState} from 'react';

export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  return {announce: setAnnouncement, announcement} as const;
}
