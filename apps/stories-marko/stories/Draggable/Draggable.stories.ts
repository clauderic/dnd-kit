import type { Meta, StoryObj } from "@storybook/marko";
import DraggableApp from "./DraggableApp.marko";

const meta = {
  title: "Draggable/Basic setup",
  component: DraggableApp,
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof DraggableApp>;

export const Example: Story = {
  args: {},
};
