import type {Meta, StoryObj} from '@storybook/vue3-vite';
import {h} from 'vue';

import MultipleListsApp from './MultipleListsApp.vue';
import multipleListsSource from './MultipleListsApp.vue?raw';
import sortableColumnSource from './SortableColumn.vue?raw';
import sortableItemSource from './SortableItem.vue?raw';
import {baseStyles, sortableStyles, multipleListsStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const styles = [baseStyles, sortableStyles, multipleListsStyles].join('\n\n');

const meta: Meta<typeof MultipleListsApp> = {
  title: 'Sortable/Multiple lists',
  component: MultipleListsApp,
};

export default meta;
type Story = StoryObj<typeof MultipleListsApp>;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => ({
    setup() {
      return () => h('div', [h('style', styles), h(MultipleListsApp)]);
    },
  }),
  parameters: {
    codesandbox: {
      files: {
        'src/App.vue': multipleListsSource,
        'src/SortableColumn.vue': sortableColumnSource,
        'src/SortableItem.vue': sortableItemSource,
        'src/styles.css': styles,
      },
    },
  },
};
