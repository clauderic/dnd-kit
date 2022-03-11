import React, {useState} from 'react';

import {Drawer} from './Drawer';

export default {
  title: 'Examples/Drawer/Sheet',
};

function DrawerExample() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{padding: 40}}>
      <button onClick={() => setExpanded((value) => !value)}>
        {expanded ? 'Close' : 'Open'}
      </button>
      <Drawer expanded={expanded} header={'Drag me'} onChange={setExpanded}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac
          mauris sit amet diam pulvinar vestibulum. Sed malesuada ultrices
          hendrerit.
        </p>

        <p>
          Class aptent taciti sociosqu ad litora torquent per conubia nostra,
          per inceptos himenaeos. Nam nisi tortor, egestas volutpat tortor
          auctor, efficitur molestie urna. Vestibulum blandit erat massa, eu
          ornare diam porttitor at.
        </p>
      </Drawer>
    </div>
  );
}

export const BottomSheet = () => <DrawerExample />;
