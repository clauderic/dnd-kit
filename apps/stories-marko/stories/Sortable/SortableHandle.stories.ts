import type {Meta, StoryObj} from '@storybook/marko';
import SortableHandleApp from './SortableHandleApp.marko';

const meta = {
  title: 'Sortable/Vertical list',
  component: SortableHandleApp,
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof SortableHandleApp>;

export const WithDragHandle: Story = {
  name: 'With drag handle',
  args: {},
};
