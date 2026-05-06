import type {Meta, StoryObj} from '@storybook/marko';
import DragOverlayDropApp from './DragOverlayDropApp.marko';

const meta = {
  title: 'Draggable/Drag overlay',
  component: DragOverlayDropApp,
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof DragOverlayDropApp>;

export const WithDrop: Story = {
  name: 'With drop target',
  args: {},
};
