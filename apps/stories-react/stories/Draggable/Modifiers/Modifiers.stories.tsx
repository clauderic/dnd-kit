import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from '@dnd-kit/abstract/modifiers';
import {RestrictToElement, RestrictToWindow} from '@dnd-kit/dom/modifiers';

import docs from './docs/ModifierDocs.mdx';
import {DraggableExample} from '../DraggableExample';
import {SnapToGridExample} from './SnapToGridExample';
import styles from './styles.module.css';

const meta: Meta<typeof DraggableExample> = {
  title: 'React/Draggable/Modifiers',
  component: DraggableExample,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DraggableExample>;

export const VerticalAxis: Story = {
  name: 'Vertical axis',
  args: {
    modifiers: [RestrictToVerticalAxis],
  },
};

export const HorizontalAxis: Story = {
  name: 'Horizontal axis',
  args: {
    modifiers: [RestrictToHorizontalAxis],
  },
};

export const WindowModifier: Story = {
  name: 'Restrict to window',
  args: {
    modifiers: [RestrictToWindow],
  },
};

export const ContainerModifier: Story = {
  name: 'Restrict to container',
  args: {
    container({children}) {
      return (
        <div className={styles.Container} data-container>
          {children}
        </div>
      );
    },
    modifiers: [
      RestrictToElement.configure({
        element() {
          return document.querySelector('[data-container]');
        },
      }),
    ],
  },
};

export const SnapModifierExample: Story = {
  name: 'Snap to grid',
  render: SnapToGridExample,
};
