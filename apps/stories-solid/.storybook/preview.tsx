// @ts-nocheck
import { createEffect, JSX } from 'solid-js';
import React from 'react';

import { Code } from '../components-docs';

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
      codePanel: false,
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
          'Solid',
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
