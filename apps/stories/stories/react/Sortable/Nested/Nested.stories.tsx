import type {Meta, StoryObj} from '@storybook/react';
import {pointerIntersection} from '@dnd-kit/collision';

import {NestedSortableExample} from '../NestedSortableExample.tsx';

const meta: Meta<typeof NestedSortableExample> = {
  title: 'React/Sortable/Nested',
  component: NestedSortableExample,
};

export default meta;
type Story = StoryObj<typeof NestedSortableExample>;

const defaultArgs = {
  debug: false,
  layout: 'grid',
  optimistic: false,
  getItemStyle() {
    return {
      minHeight: 180,
      minWidth: 180,
    };
  },
} as const;

export const Nested: Story = {
  name: 'Nested grids',
  args: {
    ...defaultArgs,
    collisionDetector: pointerIntersection,
    optimistic: false,
  },
};

export const Debug: Story = {
  name: 'Debug',
  args: {
    ...defaultArgs,
    debug: true,
  },
};
