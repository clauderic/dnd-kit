import type {Meta, StoryObj} from '@storybook/svelte-vite';

import MultipleDroppableApp from './MultipleDroppableApp.svelte';
import multipleDroppableSource from './MultipleDroppableApp.svelte?raw';
import draggableItemSource from '../DraggableItem.svelte?raw';
import droppableZoneSource from '../DroppableZone.svelte?raw';
import {
  baseStyles,
  draggableStyles,
  droppableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta<typeof MultipleDroppableApp> = {
  title: 'Droppable/Multiple drop targets',
  component: MultipleDroppableApp,
};

export default meta;
type Story = StoryObj<typeof MultipleDroppableApp>;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': multipleDroppableSource.replace(
          /from '\.\.\/(\w+\.svelte)'/g,
          "from './$1'"
        ),
        'src/DraggableItem.svelte': draggableItemSource,
        'src/DroppableZone.svelte': droppableZoneSource,
        'src/styles.css': [baseStyles, draggableStyles, droppableStyles].join(
          '\n\n'
        ),
      },
    },
  },
};
