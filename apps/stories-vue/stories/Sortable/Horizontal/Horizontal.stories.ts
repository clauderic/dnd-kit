import type {Meta, StoryObj} from '@storybook/vue3-vite';

import HorizontalSortableApp from './HorizontalSortableApp.vue';
import horizontalSortableSource from './HorizontalSortableApp.vue?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Horizontal list',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => ({components: {HorizontalSortableApp}, template: '<HorizontalSortableApp />'}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': horizontalSortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};
