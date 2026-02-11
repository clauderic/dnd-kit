import type {Meta, StoryObj} from '@storybook/react-vite';

import SortableApp from './SortableApp.tsx';
import sortableSource from './SortableApp.tsx?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';
import {QuickstartExample} from './Quickstart.tsx';

import docs from './docs/SortableDocs.mdx';

const meta: Meta<typeof SortableApp> = {
  component: SortableApp,
  title: 'React/Sortable',
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
    codesandbox: {
      files: {
        'src/App.tsx': sortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SortableApp>;

export const Example: Story = {
  name: 'Example',
};

export const Quickstart: Story = {
  name: 'Quickstart',
  tags: ['hidden'],
  render: () => <QuickstartExample />,
};
