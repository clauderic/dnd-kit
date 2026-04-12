import type {Meta, StoryObj} from '@storybook/marko';
import MultipleDroppableApp from './MultipleDroppableApp.marko';

const meta = {
  title: 'Droppable/Multiple drop targets',
  component: MultipleDroppableApp,
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof MultipleDroppableApp>;

export const Example: Story = {
  args: {},
};