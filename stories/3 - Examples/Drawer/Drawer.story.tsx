import React, {useState} from 'react';

import {Sortable} from '../../2 - Presets/Sortable/Sortable';

import {Drawer} from './Drawer';

export default {
  title: 'Examples/Drawer/Sheet',
};

interface Props {
  children: React.ReactNode;
}

function DrawerExample({children}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{padding: 40}}>
      <button onClick={() => setExpanded((value) => !value)}>
        {expanded ? 'Close' : 'Open'}
      </button>
      <Drawer
        expanded={expanded}
        header={'Bottom sheet'}
        onChange={setExpanded}
      >
        {children}
      </Drawer>
    </div>
  );
}

export const BottomSheet = () => (
  <DrawerExample>
    <p style={{lineHeight: 2}}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac
      mauris sit amet diam pulvinar vestibulum. Sed malesuada ultrices
      hendrerit.
    </p>

    <Sortable handle />

    <p style={{lineHeight: 2}}>
      Class aptent taciti sociosqu ad litora torquent per conubia nostra, per
      inceptos himenaeos. Nam nisi tortor, egestas volutpat tortor auctor,
      efficitur molestie urna. Vestibulum blandit erat massa, eu ornare diam
      porttitor at.
    </p>
  </DrawerExample>
);
