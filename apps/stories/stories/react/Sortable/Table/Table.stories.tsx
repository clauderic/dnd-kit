import type {Meta, StoryObj} from '@storybook/react-vite';

import {TableExample} from './TableExample.tsx';
import {TanstackTableExample} from './TanstackTableExample.tsx';

const meta: Meta = {
  title: 'React/Sortable/Table',
};

export default meta;

export const Example: StoryObj<typeof TableExample> = {
  name: 'Example',
  render: () => <TableExample />,
};

export const TanstackTable: StoryObj<typeof TanstackTableExample> = {
  name: 'Tanstack Table',
  render: () => <TanstackTableExample />,
};
