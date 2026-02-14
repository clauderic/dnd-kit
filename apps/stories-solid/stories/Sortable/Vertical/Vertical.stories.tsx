import type {Meta, StoryObj} from 'storybook-solidjs';

import App from '../SortableApp';
import sortableSource from '../SortableApp.tsx?raw';
import DragHandleApp from '../SortableDragHandleApp';
import sortableDragHandleSource from '../SortableDragHandleApp.tsx?raw';
import {
  baseStyles,
  handleStyles,
  sortableStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Vertical list',
  component: App,
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': sortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

export const WithDragHandle: Story = {
  name: 'Drag handle',
  render: () => <DragHandleApp />,
  decorators: [
    (Story) => (
      <>
        <style>{handleStyles}</style>
        <Story />
      </>
    ),
  ],
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': sortableDragHandleSource,
        'src/styles.css': [baseStyles, sortableStyles, handleStyles].join('\n\n'),
      },
    },
  },
};
