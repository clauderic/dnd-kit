import type {Meta, StoryObj} from '@storybook/vue3-vite';

import DroppableExample from './DroppableExample.vue';

const meta: Meta<typeof DroppableExample> = {
  title: 'Droppable/Basic setup',
  component: DroppableExample,
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const Example: Story = {};
