import type {Meta, StoryObj} from '@storybook/react';
import {Modifier} from '@dnd-kit/abstract';

import {SortableExample} from '../SortableExample';

const meta: Meta<typeof SortableExample> = {
  title: 'React/Sortable/Vertical',
  component: SortableExample,
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

export const BasicSetup: Story = {
  name: 'Basic setup',
  args: {
    debug: false,
    itemCount: 100,
  },
};

export const WithDragHandle: Story = {
  name: 'Drag handle',
  args: {
    debug: false,
    dragHandle: true,
    itemCount: 100,
  },
};

export const VariableHeights: Story = {
  name: 'Variable heights',
  args: {
    debug: false,
    getItemStyle(id) {
      const heights = {1: 100, 3: 150, 5: 200, 8: 100, 12: 150};

      return {
        height: heights[id],
      };
    },
  },
};

export const Clone: Story = {
  name: 'Clone feedback',
  args: {
    debug: false,
    feedback: 'clone',
  },
};

class VerticalModifier extends Modifier {
  apply({transform}) {
    return {
      ...transform,
      x: 0,
    };
  }
}

export const CustomDragLayer: Story = {
  name: 'Restrict axis',
  args: {
    debug: false,
    modifiers: [VerticalModifier],
  },
};
