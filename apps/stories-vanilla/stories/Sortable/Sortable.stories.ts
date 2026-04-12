import type {Meta, StoryObj} from '@storybook/html-vite';

import App from './SortableApp.ts';
import sortableSource from './SortableApp.ts?raw';
import DynamicFeedbackApp from './SortableDynamicFeedbackApp.ts';
import sortableDynamicFeedbackSource from './SortableDynamicFeedbackApp.ts?raw';
import {baseStyles, sortableStyles} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Sortable/Vertical list',
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
  render: () => App(),
  parameters: {
    codesandbox: {
      files: {
        'src/App.ts': sortableSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

export const DynamicFeedback: Story = {
  name: 'Dynamic feedback',
  render: () => DynamicFeedbackApp(),
  parameters: {
    codesandbox: {
      files: {
        'src/App.ts': sortableDynamicFeedbackSource,
        'src/styles.css': [baseStyles, sortableStyles].join('\n\n'),
      },
    },
  },
};

export const NestedScroll: Story = {
  name: 'Nested scroll',
  render: () => {
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      height: '100vh',
      overflowY: 'auto',
      marginTop: '50vh',
    });
    wrapper.appendChild(App());
    return wrapper;
  },
};
