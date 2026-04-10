import type { Meta, StoryObj } from "@storybook/marko";
import SortableApp from "./SortableApp.marko";

const meta = {
  title: "Sortable/Vertical list",
  component: SortableApp,
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof SortableApp>;

export const BasicSetup: Story = {
  name: "Basic setup",
  args: {},
};
