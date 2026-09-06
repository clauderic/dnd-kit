import type {Meta, StoryObj} from '@storybook/react-vite';

import {NestedReproductions} from './NestedReproductions.tsx';

const meta = {
  title: 'React/Sortable/Collision Reproductions/Nested',
  component: NestedReproductions,
  parameters: {layout: 'fullscreen'},
} satisfies Meta<typeof NestedReproductions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PuckNestedGrid: Story = {
  name: 'Puck nested grid (PR 1610)',
  args: {scenario: 'puck-grid'},
};

export const NestedListsRootTransfer: Story = {
  name: 'Nested lists root transfer (PR 1524)',
  args: {scenario: 'nested-lists'},
};

export const VariableSizeNestedGrid: Story = {
  name: 'Variable-size nested grid',
  args: {scenario: 'variable-size'},
};

export const OwnDescendantExclusion: Story = {
  name: 'Own-descendant exclusion (PR 1524)',
  args: {scenario: 'own-descendant'},
};
