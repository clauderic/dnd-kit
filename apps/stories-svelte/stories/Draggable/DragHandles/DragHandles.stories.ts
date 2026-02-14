import type {Meta, StoryObj} from '@storybook/svelte-vite';

import DragHandlesApp from './DragHandlesApp.svelte';
import dragHandlesSource from './DragHandlesApp.svelte?raw';
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
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': dragHandlesSource,
        'src/styles.css': [baseStyles, draggableStyles, handleStyles].join(
          '\n\n'
        ),
      },
    },
  },
};
