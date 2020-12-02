import React from 'react';

import {UniqueIdentifier} from '../../../../types';

interface Props {
  id: UniqueIdentifier;
  value: string;
}

const hiddenStyles: React.CSSProperties = {
  display: 'none',
};

export function HiddenText({id, value}: Props) {
  return (
    <div id={id} style={hiddenStyles}>
      {value}
    </div>
  );
}
