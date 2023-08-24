import type {Meta, StoryObj} from '@storybook/react';
import {RestrictToHorizontalAxis} from '@dnd-kit/abstract/modifiers';

import {SortableExample} from '../SortableExample';

const meta: Meta<typeof SortableExample> = {
  title: 'React/Sortable/Horizontal',
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

const defaultArgs = {
  debug: false,
  layout: 'horizontal',
  getItemStyle() {
    return {width: 180};
  },
} as const;

export const Horizontal: Story = {
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

export const VariableWidths: Story = {
  name: 'Variable widths',
  args: {
    ...defaultArgs,
    getItemStyle(id) {
      const widths = {0: 140, 2: 120, 4: 140, 5: 240, 8: 100, 12: 150};

      return {
        width: widths[id] ?? 180,
      };
    },
  },
};

export const Clone: Story = {
  name: 'Clone feedback',
  args: {
    ...defaultArgs,
    feedback: 'clone',
  },
};

export const HorizontalAxis: Story = {
  name: 'Restrict axis',
  args: {
    ...defaultArgs,
    modifiers: [RestrictToHorizontalAxis],
  },
};

export const Debug: Story = {
  name: 'Debug',
  args: {
    ...defaultArgs,
    debug: true,
  },
};
