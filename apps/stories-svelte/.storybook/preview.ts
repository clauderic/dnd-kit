import '@dnd-kit/stories-shared/register';
import {withCodeSandbox} from '@dnd-kit/storybook-addon-codesandbox/decorator-dom';

const preview = {
  decorators: [withCodeSandbox],
  parameters: {
    codesandbox: {
      provider: 'stackblitz',
      files: {
        'index.html': [
          '<!DOCTYPE html>',
          '<html>',
          '<head>',
          '  <meta charset="UTF-8" />',
          '</head>',
          '<body>',
          '  <div id="app"></div>',
          '  <script type="module" src="/src/main.js"></script>',
          '</body>',
          '</html>',
        ].join('\n'),
        'src/main.js': [
          "import './styles.css';",
          "import {mount} from 'svelte';",
          "import App from './App.svelte';",
          '',
          "mount(App, {target: document.getElementById('app')});",
        ].join('\n'),
        'vite.config.js': [
          "import {svelte} from '@sveltejs/vite-plugin-svelte';",
          "import {defineConfig} from 'vite';",
          '',
          'export default defineConfig({',
          '  plugins: [svelte()],',
          '});',
        ].join('\n'),
        'package.json': JSON.stringify(
          {
            name: 'dnd-kit-sandbox',
            private: true,
            type: 'module',
            scripts: {
              dev: 'vite dev',
              start: 'vite dev',
            },
            dependencies: {
              '@dnd-kit/abstract': 'beta',
              '@dnd-kit/dom': 'beta',
              '@dnd-kit/svelte': 'beta',
              '@dnd-kit/helpers': 'beta',
              '@dnd-kit/collision': 'beta',
              svelte: '^5.29.0',
            },
            devDependencies: {
              vite: '^6.0.0',
              '@sveltejs/vite-plugin-svelte': '^5.0.0',
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
          ['Basic setup', 'Drag handles', 'Drag overlay'],
          'Droppable',
          'Sortable',
          ['Vertical list', 'Horizontal list', 'Grid', 'Multiple lists'],
        ],
      },
    },
  },
};

export default preview;
