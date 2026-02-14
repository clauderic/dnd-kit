import type {Meta, StoryObj} from '@storybook/svelte-vite';

import MultipleListsApp from './MultipleListsApp.svelte';
import multipleListsSource from './MultipleListsApp.svelte?raw';
import sortableColumnSource from './SortableColumn.svelte?raw';
import sortableItemSource from './SortableItem.svelte?raw';
import {
  baseStyles,
  sortableStyles,
  multipleListsStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const styles = [baseStyles, sortableStyles, multipleListsStyles].join('\n\n');

const meta: Meta<typeof MultipleListsApp> = {
  title: 'Sortable/Multiple lists',
  component: MultipleListsApp,
};

export default meta;
type Story = StoryObj<typeof MultipleListsApp>;

export const BasicSetup: Story = {
  name: 'Basic setup',
  parameters: {
    codesandbox: {
      files: {
        'src/App.svelte': multipleListsSource,
        'src/SortableColumn.svelte': sortableColumnSource,
        'src/SortableItem.svelte': sortableItemSource,
        'src/styles.css': styles,
      },
    },
  },
};
