import type {Meta, StoryObj} from '@storybook/html-vite';

import {SortableExample} from './SortableExample.ts';
import sortableSource from './SortableApp.ts?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Vertical list',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => SortableExample().root,
  parameters: {
    codesandbox: {
      files: {
        'src/App.js': sortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};
