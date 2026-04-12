import type {Meta, StoryObj} from '@storybook/vue3-vite';

import SortableApp from '../SortableApp.vue';
import sortableSource from '../SortableApp.vue?raw';
import SortableDragHandleApp from '../SortableDragHandleApp.vue';
import sortableDragHandleSource from '../SortableDragHandleApp.vue?raw';
import SortableDynamicFeedbackApp from '../SortableDynamicFeedbackApp.vue';
import sortableDynamicFeedbackSource from '../SortableDynamicFeedbackApp.vue?raw';
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

export const DynamicFeedback: Story = {
  name: 'Dynamic feedback',
  render: () => ({components: {SortableDynamicFeedbackApp}, template: '<SortableDynamicFeedbackApp />'}),
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': sortableDynamicFeedbackSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

export const NestedScroll: Story = {
  name: 'Nested scroll',
  render: () => ({
    components: {SortableApp},
    template: '<div style="height: 100vh; overflow-y: auto; margin-top: 50vh"><SortableApp /></div>',
  }),
};
