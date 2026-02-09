import type {Meta, StoryObj} from '@storybook/vue3-vite';

import MultipleListsExample from './MultipleListsExample.vue';

const meta: Meta<typeof MultipleListsExample> = {
  title: 'Sortable/Multiple lists',
  component: MultipleListsExample,
};

export default meta;
type Story = StoryObj<typeof MultipleListsExample>;

export const BasicSetup: Story = {
  name: 'Basic setup',
};
