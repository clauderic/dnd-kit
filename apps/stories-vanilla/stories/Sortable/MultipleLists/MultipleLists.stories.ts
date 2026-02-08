import type {Meta, StoryObj} from '@storybook/html-vite';

import {MultipleListsExample} from './MultipleListsExample.ts';

const meta: Meta = {
  title: 'Sortable/Multiple lists',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => MultipleListsExample().root,
};
