import type {Meta, StoryObj} from '@storybook/react';
import {pointerIntersection} from '@dnd-kit/collision';

import {SortableExample} from '../SortableExample';

const meta: Meta<typeof SortableExample> = {
  title: 'React/Sortable/Grid',
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

const defaultArgs = {
  debug: false,
  layout: 'grid',
  getItemStyle() {
    return {
      height: 180,
      width: 180,
    };
  },
} as const;

export const Grid: Story = {
  name: 'Basic setup',
  args: defaultArgs,
};

export const DragHandle: Story = {
  name: 'Drag handle',
  args: {
    ...defaultArgs,
    dragHandle: true,
  },
};

export const LargeFirstTile: Story = {
  name: 'Large first tile',
  args: {
    ...defaultArgs,
    collisionDetector: pointerIntersection,
    getItemStyle(_, index) {
      if (index === 0) {
        return {
          maxWidth: 'initial',
          gridRowStart: 'span 2',
          gridColumnStart: 'span 2',
        };
      }

      return {
        height: 150,
        width: 150,
      };
    },
  },
};

export const Clone: Story = {
  name: 'Clone feedback',
  args: {
    ...defaultArgs,
    collisionDetector: pointerIntersection,
    getItemStyle(_, index) {
      if (index === 0) {
        return {
          maxWidth: 'initial',
          gridRowStart: 'span 2',
          gridColumnStart: 'span 2',
        };
      }

      return {
        height: 150,
        width: 150,
      };
    },
    feedback: 'clone',
  },
};
