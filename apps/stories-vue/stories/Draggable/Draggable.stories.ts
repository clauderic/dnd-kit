import type {Meta, StoryObj} from '@storybook/vue3-vite';

import DraggableExample from './DraggableExample.vue';

const meta: Meta<typeof DraggableExample> = {
  title: 'Draggable/Basic setup',
  component: DraggableExample,
};

export default meta;
type Story = StoryObj<typeof DraggableExample>;

export const Example: Story = {};
