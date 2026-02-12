import {h} from 'vue';
import type {Meta, StoryObj} from '@storybook/vue3-vite';

import DragOverlayApp from './DragOverlayApp.vue';
import dragOverlaySource from './DragOverlayApp.vue?raw';
import {
  baseStyles,
  draggableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof DragOverlayApp> = {
  title: 'Draggable/Drag overlay',
  component: DragOverlayApp,
};

export default meta;
type Story = StoryObj<typeof DragOverlayApp>;

export const Example: Story = {
  decorators: [
    (story) => ({
      setup() {
        return () =>
          h('div', [
            h('style', baseStyles),
            h('style', draggableStyles),
            h(story()),
          ]);
      },
    }),
  ],
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': dragOverlaySource,
        'src/styles.css': [baseStyles, draggableStyles].join('\n\n'),
      },
    },
  },
};
