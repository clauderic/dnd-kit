import type {Meta, StoryObj} from 'storybook-solidjs-vite';
import {pointerIntersection} from '@dnd-kit/collision';

import {SortableExample} from '../SortableExample';

const meta: Meta<typeof SortableExample> = {
  title: 'Solid/Sortable/Grid',
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

const defaultArgs = {
  debug: false,
  layout: 'grid',
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

export const VariableSizes: Story = {
  name: 'Variable sizes',
  args: {
    ...defaultArgs,
    itemCount: 14,
    collisionDetector: pointerIntersection,
    getItemStyle(id: unknown, index: number) {
      if (index === 0 || index === 10) {
        return {
          'max-width': 'initial',
          'grid-row-start': 'span 2',
          'grid-column-start': 'span 2',
        };
      }
      return {};
    },
  },
};

export const Clone: Story = {
  name: 'Clone feedback',
  args: {
    ...defaultArgs,
    collisionDetector: pointerIntersection,
    getItemStyle(id: unknown, index: number) {
      if (index === 0 || index === 2 || index === 10) {
        return {
          'max-width': 'initial',
          'grid-row-start': 'span 2',
          'grid-column-start': 'span 2',
        };
      }

      if (index === 12) {
        return {
          'grid-row-start': 'span 2',
        };
      }
      return {};
    },
    feedback: 'clone',
  },
};

export const Debug: Story = {
  name: 'Debug',
  args: {
    ...defaultArgs,
    debug: true,
  },
};
