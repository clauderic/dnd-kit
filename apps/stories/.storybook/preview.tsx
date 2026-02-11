import React, {useEffect, type PropsWithChildren} from 'react';
import {Unstyled} from '@storybook/addon-docs/blocks';

import '@dnd-kit/stories-shared/register';
import {Code} from '../stories/components';
import {
  draggableStyles,
  droppableStyles,
  sortableStyles,
  multipleListsStyles,
} from '@dnd-kit/stories-shared/styles/sandbox';
import {withCodeSandbox} from '@dnd-kit/storybook-addon-codesandbox/decorator';

// Inject sandbox-compatible CSS classes into Storybook so the Example
// stories render identically to their CodeSandbox counterparts.
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.setAttribute('data-sandbox-styles', '');
  style.textContent = [draggableStyles, droppableStyles, sortableStyles, multipleListsStyles].join('\n\n');
  document.head.appendChild(style);
}

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
    withCodeSandbox,
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
    codesandbox: {
      dependencies: {
        '@dnd-kit/abstract': 'beta',
        '@dnd-kit/dom': 'beta',
        '@dnd-kit/react': 'beta',
        '@dnd-kit/helpers': 'beta',
        '@dnd-kit/collision': 'beta',
        'react': '^19.0.0',
        'react-dom': '^19.0.0',
      },
      entry: [
        "import './styles.css';",
        "import React from 'react';",
        "import {createRoot} from 'react-dom/client';",
        "import App from './App';",
        "",
        "createRoot(document.getElementById('root')).render(<App />);",
      ].join('\n'),
      mainFile: 'src/App.tsx',
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
