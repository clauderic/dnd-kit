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
  0: 100,
  1: 150,
  2: 200,
  3: 100,
  4: 150,
};

export const Basic: Story = {
  name: 'Equal heights',
  args: {},
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

export const RestrictAxis: Story = {
  name: 'Restrict axis',
  args: {
    debug: false,
    modifiers: [RestrictToVerticalAxis],
  },
};
