import type {Meta, StoryObj} from '@storybook/html-vite';

import App from './HorizontalSortableApp.ts';
import horizontalSortableSource from './HorizontalSortableApp.ts?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Horizontal list',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => App(),
  parameters: {
    codesandbox: {
      files: {
        'src/App.ts': horizontalSortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};
