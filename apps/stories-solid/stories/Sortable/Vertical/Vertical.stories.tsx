import type {Meta, StoryObj} from 'storybook-solidjs';

import {SortableExample} from '../SortableExample';
import sortableSource from '../SortableApp.tsx?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Vertical list',
  component: SortableExample,
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  args: {
    layout: 'vertical',
  },
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': sortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};
