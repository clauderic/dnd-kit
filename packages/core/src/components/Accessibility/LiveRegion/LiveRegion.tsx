import React from 'react';

import {UniqueIdentifier} from '../../../types';

export interface Props {
  id: UniqueIdentifier;
  announcements: string[];
}

// Hide element visually but keep it readable by screen readers
const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(100%)',
};

export function LiveRegion({id, announcements}: Props) {
  return (
    <div
      id={id}
      style={visuallyHidden}
      aria-live="assertive"
      aria-relevant="additions"
      aria-atomic
    >
      {announcements.map((announcement, index) => (
        <span key={index}>{announcement}</span>
      ))}
    </div>
  );
}
