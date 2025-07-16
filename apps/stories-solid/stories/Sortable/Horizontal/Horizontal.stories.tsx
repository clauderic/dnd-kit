import type {Meta, StoryObj} from 'storybook-solidjs-vite';
import {RestrictToHorizontalAxis} from '@dnd-kit/abstract/modifiers';

import {SortableExample} from '../SortableExample';
import type { UniqueIdentifier } from '@dnd-kit/abstract';

const meta: Meta<typeof SortableExample> = {
  title: 'Solid/Sortable/Horizontal list',
  component: SortableExample,
};

const defaultArgs = {
  debug: false,
  layout: 'horizontal',
  getItemStyle() {
    return {width: '180px'};
  },
} as const;

export default meta;
type Story = StoryObj<typeof SortableExample>;

const widths: Record<UniqueIdentifier, number> = {
  0: 100,
  1: 150,
  2: 200,
  3: 100,
  4: 150,
};

export const Basic: Story = {
  name: 'Equal widths',
  args: defaultArgs,
};
      
export const Variablewidths: Story = {
  name: 'Variable widths',
  args: {
    ...defaultArgs,
    getItemStyle(id: UniqueIdentifier, index: number) {
      return {
        width: `${widths[id]}px`,
      };
    },
  },
};

export const RestrictAxis: Story = {
  name: 'Restrict axis',
  args: {
    ...defaultArgs,
    modifiers: [RestrictToHorizontalAxis],
  },
};
