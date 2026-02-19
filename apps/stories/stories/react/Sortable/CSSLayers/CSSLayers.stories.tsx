import type {Meta, StoryObj} from '@storybook/react-vite';

import {CSSLayersExample} from './CSSLayersExample';

const meta: Meta<typeof CSSLayersExample> = {
  title: 'React/Sortable/CSS Layers',
  component: CSSLayersExample,
  tags: ['hidden'],
};

export default meta;
type Story = StoryObj<typeof CSSLayersExample>;

export const BasicSetup: Story = {
  name: 'Basic setup',
};
