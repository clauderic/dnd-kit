import type {Meta, StoryObj} from 'storybook-solidjs';

import App from './HorizontalSortableApp';
import horizontalSortableSource from './HorizontalSortableApp.tsx?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Horizontal list',
  component: App,
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': horizontalSortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

export const NestedScroll: Story = {
  name: 'Nested scroll',
  render: () => (
    <div style={{width: '100vw', 'overflow-x': 'auto', 'margin-left': '50vw'}}>
      <App />
    </div>
  ),
};
