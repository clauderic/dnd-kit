// @ts-nocheck
import { createEffect, JSX } from 'solid-js';
import React from 'react';

import { Button, Dropzone, Item } from '../components';
import { Code } from '../components/docs';

// Register web components
customElements.define('button-component', Button);
customElements.define('dropzone-component', Dropzone);
customElements.define('item-component', Item);

const DarkModeProvider = (props: { children: JSX.Element }) => {
  createEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const dark = params.get('dark');
      const hero = params.get('hero');

      if (dark === 'false') {
        document.body.classList.remove('dark');
      } else if (dark === 'true') {
        document.body.classList.add('dark');
      }

      if (hero === 'true') {
        document.body.classList.add('hero');
      }
    }
  });

  return props.children;
};

console.log('Code', Code);

const preview = {
  decorators: [
    (Story: any) => {
      return (
        <DarkModeProvider>
          <Story />
        </DarkModeProvider>
      );
    },
  ],
  parameters: {
    docs: {
      components: {
        // pre: (props: any) => React.createElement('pre', { ...props, className: 'sb-unstyled' }),
        // code: Code,
      },
    },
    darkMode: {
      stylePreview: true,
    },
    options: {
      storySort: {
        order: [
          'Docs',
          'React',
          [
            'Draggable',
            'Droppable',
            'Sortable',
            [
              'Vertical list',
              'Horizontal list',
              'Grid',
              'Multiple lists',
              'Iframe',
              'Virtualized',
            ],
          ],
        ],
      },
    },
  },
};

export default preview;
