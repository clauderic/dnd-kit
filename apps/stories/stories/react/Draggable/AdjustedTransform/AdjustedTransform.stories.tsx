import type {Meta, StoryObj} from '@storybook/react-vite';

import {
  AdjustedTransformExample,
  NestedScrollablesExample,
} from './AdjustedTransformExample.tsx';

const meta: Meta<typeof AdjustedTransformExample> = {
  title: 'React/Draggable/Adjusted transform',
  component: AdjustedTransformExample,
};

export default meta;

export const Example: StoryObj<typeof AdjustedTransformExample> = {
  name: 'Example',
};

export const NestedScrollables: StoryObj<typeof NestedScrollablesExample> = {
  name: 'Nested scrollables',
  render: () => <NestedScrollablesExample />,
};
