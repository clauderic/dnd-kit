import React from 'react';

export interface Props {
  id: string;
  entries: [NodeJS.Timeout, string][];
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

export function LiveRegion({id, entries}: Props) {
  return (
    <div
      id={id}
      style={visuallyHidden}
      aria-live="assertive"
      aria-relevant="additions"
      aria-atomic
    >
      {entries.map(([id, entry]) => (
        <React.Fragment key={id.toString()}>{entry}</React.Fragment>
      ))}
    </div>
  );
}
