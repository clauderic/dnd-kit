'use client';

import React, {useEffect, type PropsWithChildren} from 'react';
import {Unstyled} from '@storybook/addon-docs/blocks';

import {
  registerWebComponents,
  setupDarkMode,
  sharedParameters,
} from '@dnd-kit/stories/.storybook/preview-shared';
import {Code} from '../stories/components/docs';

// Import shared global styles
import '@dnd-kit/stories/shared/styles/global.css';

// Register web components
registerWebComponents();

function DarkModeProvider({children}: PropsWithChildren) {
  useEffect(() => {
    setupDarkMode();
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
    ...sharedParameters,
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
