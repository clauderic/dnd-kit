import type {Meta, StoryObj} from 'storybook-solidjs';

import {MultipleListsExample} from './MultipleListsExample';

const meta: Meta = {
  title: 'Sortable/Multiple lists',
  component: MultipleListsExample,
  argTypes: {
    debug: {control: 'boolean'},
  },
  args: {
    debug: false,
  },
};

export default meta;
type Story = StoryObj;

export const BasicSetup: Story = {
  name: 'Basic setup',
};