import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';

import {Tree} from './Tree';
import type {Item} from './types';

const meta: Meta<typeof Tree> = {
  title: 'React/Sortable/Tree',
  component: Tree,
};

export default meta;
type Story = StoryObj<typeof Tree>;

export const Example: Story = {
  name: 'Example',
  render: () => {
    const [items, setItems] = useState<Item[]>([
      {
        id: 'Home',
        children: [],
      },
      {
        id: 'Collections',
        children: [
          {id: 'Spring', children: []},
          {id: 'Summer', children: []},
          {id: 'Fall', children: []},
          {id: 'Winter', children: []},
        ],
      },
      {
        id: 'About Us',
        children: [],
      },
      {
        id: 'My Account',
        children: [
          {id: 'Addresses', children: []},
          {id: 'Order History', children: []},
        ],
      },
    ]);

    return <Tree items={items} onChange={setItems} />;
  },
};
