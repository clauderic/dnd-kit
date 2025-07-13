import type {Meta, StoryObj} from 'storybook-solidjs-vite';

import {SortableExample} from './SortableExample';

// import docs from './docs/SortableDocs.mdx';

const meta: Meta<typeof SortableExample> = {
  component: SortableExample,
  title: 'Solid/Sortable',
  tags: ['autodocs'],
  argTypes: {
    debug: {
      control: 'boolean',
      description: 'Enable debug mode (shows debug overlays)',
    },
    dragHandle: {
      control: 'boolean',
      description: 'Show drag handle on items',
    },
    disabled: {
      control: 'object',
      description: 'Array of disabled item IDs',
    },
    feedback: {
      control: 'select',
      options: ['default', 'move', 'clone', 'none'],
      description: 'Feedback type for drag events',
    },
    modifiers: {
      control: 'object',
      description: 'Modifiers to customize drag behavior',
    },
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal', 'grid'],
      description: 'Layout of the sortable items',
    },
    transition: {
      control: 'object',
      description: 'Transition configuration for sortable items',
    },
    itemCount: {
      control: { type: 'number', min: 1, max: 100, step: 1 },
      description: 'Number of items in the list',
    },
    optimistic: {
      control: 'boolean',
      description: 'Enable optimistic UI updates during drag',
    },
    collisionDetector: {
      control: 'object',
      description: 'Custom collision detection function',
      table: { disable: true },
    },
    getItemStyle: {
      control: false,
      description: 'Function to get custom item styles',
      table: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

export const Basic: Story = {
  name: 'Basic setup',
  args: {},
};

export const WithDragHandle: Story = {
  name: 'Drag handle',
  args: {
    dragHandle: true,
  },
};

export const Clone: Story = {
  name: 'Clone feedback',
  args: {
    feedback: 'clone',
  },
};

export const DisabledItems: Story = {
  name: 'Disabled items',
  args: {
    debug: false,
    disabled: [1, 3],
  },
};

export const CustomTransition: Story = {
  name: 'Custom transition',
  args: {
    transition: {
      duration: 450,
      easing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
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

export const Debug: Story = {
  name: 'Debug mode',
  args: {
    debug: true,
  },
};
