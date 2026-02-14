import {h} from 'vue';
import type {Meta, StoryObj} from '@storybook/vue3-vite';

import DragHandlesApp from './DragHandlesApp.vue';
import dragHandlesSource from './DragHandlesApp.vue?raw';
import {
  baseStyles,
  draggableStyles,
  handleStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof DragHandlesApp> = {
  title: 'Draggable/Drag handles',
  component: DragHandlesApp,
};

export default meta;
type Story = StoryObj<typeof DragHandlesApp>;

export const Example: Story = {
  decorators: [
    (story) => ({
      setup() {
        return () =>
          h('div', [
            h('style', baseStyles),
            h('style', draggableStyles),
            h('style', handleStyles),
            h(story()),
          ]);
      },
    }),
  ],
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': dragHandlesSource,
        'src/styles.css': [baseStyles, draggableStyles, handleStyles].join(
          '\n\n'
        ),
      },
    },
  },
};
