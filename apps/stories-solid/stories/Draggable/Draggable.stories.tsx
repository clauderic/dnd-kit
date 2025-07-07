import type {Meta, StoryObj} from 'storybook-solidjs-vite';

import { KeyboardSensor } from '@dnd-kit/dom';
import { PointerSensor } from '@dnd-kit/dom';

import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from '@dnd-kit/abstract/modifiers';

import { RestrictToElement, RestrictToWindow } from '@dnd-kit/dom/modifiers';
import { DraggableExample } from './DraggableExample';
import { SnapToGridExample } from './SnapToGridExample';

import docs from './Draggable.docs.mdx';
import type { JSX } from 'solid-js';

type Story = StoryObj<typeof DraggableExample>;

const meta: Meta<typeof DraggableExample> = {
  title: 'Solid/Draggable',
  component: DraggableExample,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export const Example: Story = {
  name: 'Basic draggable',
};

export const DragHandle: Story = {
  name: 'With drag handle',
  args: {
    handle: true,
  },
};

export const DualActivators: Story = {
  name: 'Dual activators',
  args: {
    handle: true,
    sensors: [
      PointerSensor.configure({
        activatorElements(source) {
          return [source.handle, source.element];
        },
      }),
      KeyboardSensor,
    ],
  },
};


export const DragOverlay: Story = {
  name: 'With drag overlay',
  args: {
    overlay: true,
  },
};

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
    container: (props: { children: JSX.Element }) => (
      <div
        class="flex w-[60%] min-w-[300px] m-[40px_80px] h-[350px] outline-[3px] outline-black/20 bg-white items-center justify-center p-[30px] rounded-[8px] dark:outline-white/30 dark:bg-white/5"
        data-container
      >
        {props.children}
      </div>
    ),
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
  render: () => <SnapToGridExample />,
};

export default meta;
