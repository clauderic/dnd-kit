import '@dnd-kit/stories-shared/register';
import {withCodeSandbox} from '@dnd-kit/storybook-addon-codesandbox/decorator-dom';

const preview = {
  decorators: [withCodeSandbox],
  parameters: {
    codesandbox: {
      files: {
        'index.html': [
          '<!DOCTYPE html>',
          '<html>',
          '<head>',
          '  <title>Solid Demo</title>',
          '  <meta charset="UTF-8" />',
          '</head>',
          '<body>',
          '  <div id="app"></div>',
          '  <script src="src/index.js"></script>',
          '</body>',
          '</html>',
        ].join('\n'),
        'src/index.js': [
          "import './styles.css';",
          "import {render} from 'solid-js/web';",
          "import App from './App';",
          "",
          "render(App, document.getElementById('app'));",
        ].join('\n'),
        '.babelrc': JSON.stringify(
          {presets: ['babel-preset-solid']},
          null,
          2
        ),
        'tsconfig.json': JSON.stringify(
          {
            compilerOptions: {
              jsx: 'preserve',
              jsxImportSource: 'solid-js',
              noEmit: true,
            },
          },
          null,
          2
        ),
        'package.json': JSON.stringify(
          {
            name: 'dnd-kit-sandbox',
            main: 'index.html',
            dependencies: {
              '@dnd-kit/abstract': 'beta',
              '@dnd-kit/dom': 'beta',
              '@dnd-kit/solid': 'beta',
              '@dnd-kit/helpers': 'beta',
              '@dnd-kit/collision': 'beta',
              'babel-preset-solid': 'latest',
              'solid-js': '^1.9.0',
            },
            devDependencies: {
              '@babel/core': '7.2.0',
              'parcel-bundler': '^1.6.1',
            },
          },
          null,
          2
        ),
      },
      mainFile: 'src/App.tsx',
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
