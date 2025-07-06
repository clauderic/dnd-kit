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
  // parameters: {
    // docs: {
      // page: docs,
    // },
  // },
};

export default meta;
type Story = StoryObj<typeof SortableExample>;

export const Example: Story = {
  name: 'Example',
  args: {
    dragHandle: true,
    debug: false,
    itemCount: 5,
  },
};