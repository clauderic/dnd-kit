import type {Meta, StoryObj} from '@storybook/vue3-vite';

import SortableExample from '../SortableExample.vue';
import sortableSource from '../SortableApp.vue?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof SortableExample> = {
  title: 'Sortable/Vertical list',
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

export const BasicSetup: Story = {
  name: 'Basic setup',
  args: {
    layout: 'vertical',
  },
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': sortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};
