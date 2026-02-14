import type {Meta, StoryObj} from 'storybook-solidjs';

import App from './GridSortableApp';
import gridSortableSource from './GridSortableApp.tsx?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Grid',
  component: App,
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': gridSortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};
