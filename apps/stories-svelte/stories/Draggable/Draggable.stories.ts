import type {Meta, StoryObj} from '@storybook/svelte-vite';

import DraggableApp from './DraggableApp.svelte';
import draggableSource from './DraggableApp.svelte?raw';
import draggableComponentSource from './Draggable.svelte?raw';
import {
  baseStyles,
  draggableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof DraggableApp> = {
  title: 'Draggable/Basic setup',
  component: DraggableApp,
};

export default meta;
type Story = StoryObj<typeof DraggableApp>;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': draggableSource,
        'src/Draggable.svelte': draggableComponentSource,
        'src/styles.css': [baseStyles, draggableStyles].join('\n\n'),
      },
    },
  },
};
