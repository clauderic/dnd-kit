import type { Meta, StoryObj } from '@storybook/marko';
import DragOverlayApp from './DragOverlayApp.marko';

const meta = {
  title: 'Draggable/Drag overlay',
  component: DragOverlayApp,
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof DragOverlayApp>;

export const Example: Story = {
  name: 'Basic overlay',
  args: {},
};
