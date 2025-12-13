import type {Meta, StoryObj} from '@storybook/react-vite';

import {SortableExample} from './SortableExample.ts';

const meta: Meta<typeof SortableExample> = {
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

export const Example: Story = {
  name: 'Example',
};
