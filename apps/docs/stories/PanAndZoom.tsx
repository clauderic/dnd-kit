import React, {PropsWithChildren} from 'react';
import usePanZoom from 'use-pan-and-zoom';

export function PanAndZoom({children}: PropsWithChildren<{}>) {
  const {transform, setContainer, panZoomHandlers} = usePanZoom();

  return (
    <div
      ref={(el) => {
        setContainer(el);
      }}
      style={{touchAction: 'none'}}
      {...panZoomHandlers}
    >
      <div style={{display: 'flex', flexDirection: 'row', transform}}>
        {children}
      </div>
    </div>
  );
}
