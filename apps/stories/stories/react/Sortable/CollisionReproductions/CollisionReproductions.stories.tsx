import type {Meta, StoryObj} from '@storybook/react-vite';
import {CollisionReproductions} from './CollisionReproductions';

export default {
  title: 'React/Sortable/Collision reproductions',
  component: CollisionReproductions,
} satisfies Meta<typeof CollisionReproductions>;

type Story = StoryObj<typeof CollisionReproductions>;
export const Kanban: Story = {};
export const SortableKanban: Story = {args: {itemTargets: true}};
export const VerticalReversal: Story = {args: {vertical: true}};
export const StationaryScroll: Story = {args: {scrolling: true}};
