import React from 'react';

export interface Props {
  id: string;
  announcement: string;
  ariaLiveType?: "polite" | "assertive" | "off";
}

export function LiveRegion({id, announcement, ariaLiveType = "assertive"}: Props) {
  // Hide element visually but keep it readable by screen readers
  const visuallyHidden: React.CSSProperties = {
    position: 'fixed',
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(100%)',
    whiteSpace: 'nowrap',
  };
  
  return (
    <div
      id={id}
      style={visuallyHidden}
      role="status"
      aria-live={ariaLiveType}
      aria-atomic
    >
      {announcement}
    </div>
  );
}
