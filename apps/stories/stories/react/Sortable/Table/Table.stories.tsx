import type {Meta, StoryObj} from '@storybook/react-vite';

import {TableExample} from './TableExample.tsx';

const meta: Meta<typeof TableExample> = {
  title: 'React/Sortable/Table',
  component: TableExample,
};

export default meta;
type Story = StoryObj<typeof TableExample>;

export const Example: Story = {
  name: 'Example',
};
