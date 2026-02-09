import type {Meta, StoryObj} from '@storybook/vue3-vite';

import SortableExample from '../SortableExample.vue';

const meta: Meta<typeof SortableExample> = {
  title: 'Sortable/Grid',
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

export const BasicSetup: Story = {
  name: 'Basic setup',
  args: {
    layout: 'grid',
    itemCount: 20,
  },
};
