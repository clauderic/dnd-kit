import type {Meta, StoryObj} from '@storybook/react';
import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from '@dnd-kit/abstract/modifiers';
import {RestrictToElement, RestrictToWindow} from '@dnd-kit/dom/modifiers';

import {DraggableExample} from '../DraggableExample';

const meta: Meta<typeof DraggableExample> = {
  title: 'React/Draggable/Modifiers',
  component: DraggableExample,
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
    container: true,
    modifiers: [
      RestrictToElement.configure({
        getElement() {
          return document.querySelector('[data-container]');
        },
      }),
    ],
  },
};
