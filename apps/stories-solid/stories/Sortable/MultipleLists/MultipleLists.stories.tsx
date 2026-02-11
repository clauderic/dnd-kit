import type {Meta, StoryObj} from 'storybook-solidjs';

import MultipleListsApp from './MultipleListsApp.tsx';
import multipleListsSource from './MultipleListsApp.tsx?raw';
import {baseStyles, sortableStyles, multipleListsStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const styles = [baseStyles, sortableStyles, multipleListsStyles].join('\n\n');

const meta: Meta = {
  title: 'Sortable/Multiple lists',
  component: MultipleListsApp,
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => (
    <>
      <style>{styles}</style>
      <MultipleListsApp />
    </>
  ),
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': multipleListsSource,
        'src/styles.css': styles,
      },
    },
  },
};
