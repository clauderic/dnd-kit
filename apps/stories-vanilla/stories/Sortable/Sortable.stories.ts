import type {Meta, StoryObj} from '@storybook/html-vite';

import {SortableExample} from './SortableExample.ts';

const meta: Meta = {
  title: 'Sortable/Vertical list',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => SortableExample().root,
};
