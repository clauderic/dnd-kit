import '@dnd-kit/stories-shared/register';
import {withCodeSandbox} from '@dnd-kit/storybook-addon-codesandbox/decorator-dom';

const preview = {
  decorators: [withCodeSandbox],
  parameters: {
    codesandbox: {
      template: 'vue-cli',
      files: {
        'src/main.js': [
          "import {createApp} from 'vue';",
          "import App from './App.vue';",
          "import './styles.css';",
          "",
          "createApp(App).mount('#app');",
        ].join('\n'),
        'package.json': JSON.stringify(
          {
            name: 'dnd-kit-sandbox',
            version: '0.1.0',
            private: true,
            main: '/src/main.js',
            alias: {
              vue: 'vue/dist/vue.esm-bundler.js',
            },
            scripts: {
              serve: 'vue-cli-service serve',
              build: 'vue-cli-service build',
            },
            dependencies: {
              'core-js': '^3.26.1',
              '@dnd-kit/abstract': 'beta',
              '@dnd-kit/dom': 'beta',
              '@dnd-kit/vue': 'beta',
              '@dnd-kit/helpers': 'beta',
              '@dnd-kit/collision': 'beta',
              'vue': '^3.5.0',
            },
            devDependencies: {
              '@vue/cli-plugin-babel': '^5.0.8',
              '@vue/cli-plugin-typescript': '^5.0.8',
              '@vue/cli-service': '^5.0.8',
              'typescript': '^4.9.3',
            },
          },
          null,
          2
        ),
      },
      mainFile: 'src/App.vue',
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
