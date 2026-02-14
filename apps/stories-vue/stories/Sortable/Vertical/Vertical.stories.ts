import type {Meta, StoryObj} from '@storybook/vue3-vite';

import SortableApp from '../SortableApp.vue';
import sortableSource from '../SortableApp.vue?raw';
import SortableDragHandleApp from '../SortableDragHandleApp.vue';
import sortableDragHandleSource from '../SortableDragHandleApp.vue?raw';
import {
  baseStyles,
  handleStyles,
  sortableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Vertical list',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => ({components: {SortableApp}, template: '<SortableApp />'}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': sortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

export const WithDragHandle: Story = {
  name: 'Drag handle',
  render: () => ({components: {SortableDragHandleApp}, template: '<SortableDragHandleApp />'}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': sortableDragHandleSource,
        'src/styles.css': [baseStyles, sortableStyles, handleStyles].join('\n\n'),
      },
    },
  },
};
