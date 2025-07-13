import type {Meta, StoryObj} from 'storybook-solidjs-vite';
import {RestrictToVerticalAxis} from '@dnd-kit/abstract/modifiers';

import {SortableExample} from '../SortableExample';
import type { UniqueIdentifier } from '@dnd-kit/abstract';

const meta: Meta<typeof SortableExample> = {
  title: 'Solid/Sortable/Vertical list',
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

const heights: Record<UniqueIdentifier, number> = {
  1: 100,
  2: 150,
  3: 200,
  4: 100,
  5: 150,
};
      
export const VariableHeights: Story = {
  name: 'Variable heights',
  args: {
    debug: false,
    getItemStyle(id: UniqueIdentifier, index: number) {
      return {
        height: `${heights[id]}px`,
      };
    },
  },
};

export const DynamicHeights: Story = {
  name: 'Dynamic heights',
  args: {
    debug: false,
    optimistic: false, // NOTE: apply sort immediately on drag over
    getItemStyle(_: UniqueIdentifier, index: number) {
      return {
        height: `${heights[index]}px`,
      };
    },
  },
};

export const RestrictAxis: Story = {
  name: 'Restrict axis',
  args: {
    debug: false,
    modifiers: [RestrictToVerticalAxis],
  },
};
