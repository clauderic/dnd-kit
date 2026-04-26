import type {Meta, StoryObj} from '@storybook/marko';
import DragHandlesApp from './DragHandlesApp.marko';

const meta = {
  title: 'Draggable/Drag handles',
  component: DragHandlesApp,
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof DragHandlesApp>;

export const Example: Story = {
  args: {},
};
