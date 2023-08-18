import type {Meta, StoryObj} from '@storybook/react';

import {DroppableExample} from './VanillaDroppableExample';

const meta: Meta<typeof DroppableExample> = {
  component: DroppableExample,
  // parameters: {
  //   docs: {
  //     page: docs,
  //   },
  // },
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const BasicSetup: Story = {
  name: 'Basic setup',
};
