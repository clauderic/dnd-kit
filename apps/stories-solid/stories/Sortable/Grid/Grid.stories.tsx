import type {Meta, StoryObj} from 'storybook-solidjs';

import {SortableExample} from '../SortableExample';

const meta: Meta = {
  title: 'Sortable/Grid',
  component: SortableExample,
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  args: {
    layout: 'grid',
    itemCount: 20,
  },
};
