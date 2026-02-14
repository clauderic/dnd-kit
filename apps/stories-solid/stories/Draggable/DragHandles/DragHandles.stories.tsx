import type {Meta, StoryObj} from 'storybook-solidjs';

import DragHandlesApp from './DragHandlesApp';
import dragHandlesSource from './DragHandlesApp.tsx?raw';
import {
  baseStyles,
  draggableStyles,
  handleStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';

const meta: Meta = {
  title: 'Draggable/Drag handles',
  component: DragHandlesApp,
  decorators: [
    (Story) => (
      <>
        <style>{baseStyles}</style>
        <style>{draggableStyles}</style>
        <style>{handleStyles}</style>
        <Story />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Example: Story = {
  parameters: {
    codesandbox: {
      files: {
        'src/App.tsx': dragHandlesSource,
        'src/styles.css': [baseStyles, draggableStyles, handleStyles].join(
          '\n\n'
        ),
      },
    },
  },
};
