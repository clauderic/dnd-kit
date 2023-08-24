import type {Meta, StoryObj} from '@storybook/react';
import {RestrictToVerticalAxis} from '@dnd-kit/abstract/modifiers';

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

export const RestrictAxis: Story = {
  name: 'Restrict axis',
  args: {
    debug: false,
    modifiers: [RestrictToVerticalAxis],
  },
};

export const DisabledItems: Story = {
  name: 'Disabled items',
  args: {
    debug: false,
    disabled: [2, 3, 8, 12],
  },
};

export const CustomTransition: Story = {
  name: 'Custom transition',
  args: {
    debug: false,
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
};

export const DisableTransition: Story = {
  name: 'Disable transition',
  args: {
    debug: false,
    transition: {
      duration: 0,
    },
  },
};
