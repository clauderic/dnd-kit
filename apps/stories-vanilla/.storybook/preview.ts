import '@dnd-kit/stories-shared/register';
import {withCodeSandbox} from '@dnd-kit/storybook-addon-codesandbox/decorator-dom';

const preview = {
  decorators: [withCodeSandbox],
  parameters: {
    codesandbox: {
      dependencies: {
        '@dnd-kit/abstract': 'beta',
        '@dnd-kit/dom': 'beta',
        '@dnd-kit/helpers': 'beta',
        '@dnd-kit/collision': 'beta',
      },
      entry: [
        "import './styles.css';",
        "import App from './App';",
        "",
        "App();",
      ].join('\n'),
      mainFile: 'src/App.js',
    },
    darkMode: {
      stylePreview: true,
    },
    options: {
      storySort: {
        order: [
          'Draggable',
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
