import React, {ComponentProps, useState} from 'react';

import {Switch} from './Switch';

export default {
  title: 'Examples/Form Elements/Switch',
};

type Props = Pick<ComponentProps<typeof Switch>, 'disabled' | 'label'>;

function SwitchExample({disabled, label}: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <div style={{padding: 40}}>
      <Switch
        checked={checked}
        label={label}
        onChange={setChecked}
        disabled={disabled}
      />
    </div>
  );
}

export const BasicSetup = () => <SwitchExample label="Draggable switch" />;
export const Disabled = () => (
  <SwitchExample label="Disabled switch" disabled />
);
