import '@dnd-kit/stories-shared/register';
import {withCodeSandbox} from '@dnd-kit/storybook-addon-codesandbox/decorator-dom';

const preview = {
  decorators: [withCodeSandbox],
  parameters: {
    codesandbox: {
      template: 'svelte',
      files: {
        'package.json': JSON.stringify(
          {
            name: 'dnd-kit-sandbox',
            main: 'index.html',
            dependencies: {
              '@dnd-kit/abstract': 'beta',
              '@dnd-kit/dom': 'beta',
              '@dnd-kit/svelte': 'beta',
              '@dnd-kit/helpers': 'beta',
              '@dnd-kit/collision': 'beta',
              'svelte': '^5.29.0',
            },
          },
          null,
          2
        ),
      },
      mainFile: 'src/App.svelte',
    },
    darkMode: {
      stylePreview: true,
    },
    options: {
      storySort: {
        order: [
          'Draggable',
          [
            'Basic setup',
            'Drag handles',
            'Drag overlay',
          ],
          'Droppable',
          'Sortable',
          [
            'Vertical list',
            'Horizontal list',
            'Grid',
            'Multiple lists',
          ],
        ],
      },
    },
  },
};

export default preview;
