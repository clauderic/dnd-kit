import type { Meta, StoryObj } from "@storybook/marko";
import DroppableApp from "./DroppableApp.marko";

const meta = {
  title: "Droppable/Basic setup",
  component: DroppableApp,
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof DroppableApp>;

export const Example: Story = {
  args: {},
};
