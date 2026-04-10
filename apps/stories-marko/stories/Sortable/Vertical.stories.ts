import type {Meta, StoryObj} from '@storybook/marko';
import SortableApp from './SortableApp.marko';

const meta: Meta = {
  title: 'Sortable/Vertical list',
  component: SortableApp,
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
};
