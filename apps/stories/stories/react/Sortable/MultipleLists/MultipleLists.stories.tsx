import type {Meta, StoryObj} from '@storybook/react';

import {MultipleLists} from './MultipleLists';
import {Guide} from './docs/examples/Guide';
import docs from './docs/MultipleLists.mdx';

const meta: Meta<typeof MultipleLists> = {
  title: 'React/Sortable/Multiple lists',
  component: MultipleLists,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof MultipleLists>;

export const Example: Story = {
  name: 'Example',
  args: {
    debug: false,
    itemCount: 6,
  },
};

export const Hero: Story = {
  name: 'Hero',
  tags: ['hidden'],
  args: {
    columnStyle: {
      '--min-width': '250px',
      flexGrow: '1',
      flexBasis: '33%',
      backgroundColor: 'rgba(246, 246, 246, 0.7)',
    },
    defaultItems: {
      A: ['A1', 'A2', 'A3'],
      B: ['B1', 'B2'],
      C: [],
    },
  },
};

export const Guide1: Story = {
  tags: ['hidden'],
  render: () => <Guide disabled uncontrolled />,
};

export const Guide2: Story = {
  tags: ['hidden'],
  render: () => <Guide uncontrolled />,
};

export const Guide3: Story = {
  tags: ['hidden'],
  render: () => <Guide />,
};

export const Guide4: Story = {
  tags: ['hidden'],
  render: () => <Guide sortableColumns />,
};

export const Scrollable: Story = {
  name: 'Scrollable containers',
  args: {
    debug: false,
    itemCount: 25,
    scrollable: true,
  },
};

export const Grid: Story = {
  name: 'Grid',
  args: {
    debug: false,
    itemCount: 5,
    grid: true,
  },
};

export const VerticalSetup: Story = {
  name: 'Vertical',
  args: {
    debug: false,
    itemCount: 3,
    vertical: true,
  },
};

export const VerticalScrollable: Story = {
  name: 'Vertical & scrollable',
  args: {
    debug: false,
    itemCount: 25,
    scrollable: true,
    vertical: true,
  },
};

export const Debug: Story = {
  name: 'Debug',
  args: {
    debug: true,
    itemCount: 6,
  },
};
