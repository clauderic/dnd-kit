import type {Meta, StoryObj} from '@storybook/vue3-vite';

import GridSortableApp from './GridSortableApp.vue';
import gridSortableSource from './GridSortableApp.vue?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Grid',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => ({components: {GridSortableApp}, template: '<GridSortableApp />'}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': gridSortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};
