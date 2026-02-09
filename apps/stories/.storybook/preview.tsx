import React, {useEffect, type PropsWithChildren} from 'react';
import {Unstyled} from '@storybook/addon-docs/blocks';

import '@dnd-kit/stories-shared/register';
import {Code} from '../stories/components';

function DarkModeProvider({children}: PropsWithChildren) {
  useEffect(() => {
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
  }, []);

  return children;
}

const preview = {
  decorators: [
    (Story) => {
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
        pre: (props) => (
          <Unstyled>
            <pre {...props} />
          </Unstyled>
        ),
        code: Code,
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
