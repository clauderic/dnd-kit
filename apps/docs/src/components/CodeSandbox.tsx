/**
 * Sandpack-powered interactive code editor.
 *
 * Ported from docs/sandpack.js — replaces the CDN-loaded custom element
 * approach with a bundled React component.
 */
import { Sandpack, type SandpackFiles } from '@codesandbox/sandpack-react';

const theme = {
  colors: {
    surface1: '#0a0a0c',
    surface2: 'transparent',
    surface3: '#f7f7f710',
    clickable: '#969696',
    base: '#808080',
    disabled: '#4D4D4D',
    hover: '#596dff',
    accent: '#596dff',
    error: '#ffcdca',
    errorSurface: '#811e18',
  },
  syntax: {
    plain: '#f8f8f2',
    comment: { color: '#75715e' },
    keyword: { color: '#f92672' },
    tag: '#f92672',
    punctuation: '#f8f8f2',
    definition: '#a6e22e',
    property: { color: '#66d9ef' },
    static: '#ae81ff',
    string: '#e6db74',
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    mono: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
    size: '14px',
    lineHeight: '20px',
  },
};

const SHARED_DEPS = {
  '@dnd-kit/helpers': 'beta',
};

const TEMPLATE_DEPS: Record<string, Record<string, string>> = {
  react: { '@dnd-kit/react': 'beta' },
  vue: { '@dnd-kit/vue': 'beta' },
  solid: { '@dnd-kit/solid': 'beta' },
  svelte: { '@dnd-kit/svelte': 'beta' },
};

function getSolidInfraFiles(): SandpackFiles {
  return {
    '/index.html': {
      code: `<!DOCTYPE html>
<html>
<head>
  <title>Solid Demo</title>
  <meta charset="UTF-8" />
</head>
<body>
  <div id="app"></div>
  <script src="src/index.js"><\/script>
</body>
</html>`,
      hidden: true,
    },
    '/index.ts': {
      code: 'import "./styles.css";\nimport {render} from "solid-js/web";\nimport App from "./App";\n\nrender(App, document.getElementById("app"));',
      hidden: true,
    },
    '/.babelrc': {
      code: JSON.stringify({ presets: ['babel-preset-solid'] }, null, 2),
      hidden: true,
    },
    '/tsconfig.json': {
      code: JSON.stringify(
        {
          compilerOptions: {
            jsx: 'preserve',
            jsxImportSource: 'solid-js',
            noEmit: true,
          },
        },
        null,
        2,
      ),
      hidden: true,
    },
  };
}

function getSvelteInfraFiles(): SandpackFiles {
  return {
    '/package.json': {
      code: JSON.stringify({
        scripts: { dev: 'vite' },
        devDependencies: {
          svelte: '^5.29.0',
          '@dnd-kit/svelte': 'beta',
          '@dnd-kit/helpers': 'beta',
          vite: '4.1.4',
          'esbuild-wasm': '0.17.12',
        },
      }),
      hidden: true,
    },
    '/vite.config.js': {
      code: `import { defineConfig } from 'vite';
import { compile, compileModule } from 'svelte/compiler';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@dnd-kit/svelte', '@dnd-kit/svelte/sortable'],
  },
  plugins: [{
    name: 'svelte',
    enforce: 'pre',
    transform(code, id) {
      const filename = id.split('?')[0];
      const isSvelte = filename.endsWith('.svelte');
      const isSvelteModule = /\\.svelte\\.[jt]s$/.test(filename);
      if (!isSvelte && !isSvelteModule) return null;
      try {
        if (isSvelte) {
          const { js } = compile(code, { filename, generate: 'dom', css: 'injected', dev: false });
          return { code: js.code, map: js.map };
        } else {
          const { js } = compileModule(code, { filename, generate: 'client', dev: false });
          return { code: js.code, map: js.map };
        }
      } catch (e) {
        throw new Error('Svelte compile error in ' + filename + ': ' + e.message);
      }
    },
  }],
});`,
      hidden: true,
    },
    '/index.html': {
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Svelte Demo</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"><\/script>
</body>
</html>`,
      hidden: true,
    },
    '/src/main.js': {
      code: `import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });`,
      hidden: true,
    },
  };
}

interface CodeSandboxProps {
  files: SandpackFiles;
  height?: number;
  showTabs?: boolean;
  template?: string;
}

export function CodeSandbox({
  files: inputFiles,
  height,
  showTabs = false,
  template = 'react',
}: CodeSandboxProps) {
  const isSolid = template === 'solid';
  const isSvelte = template === 'svelte';

  const dependencies: Record<string, string> = {
    ...SHARED_DEPS,
    ...(TEMPLATE_DEPS[template] || { '@dnd-kit/dom': 'beta' }),
  };

  let files = { ...inputFiles };

  if (isSolid) {
    dependencies['solid-js'] = '^1.9.0';
    dependencies['babel-preset-solid'] = 'latest';
    files = { ...getSolidInfraFiles(), ...files };
  }

  if (isSvelte) {
    files = { ...getSvelteInfraFiles(), ...files };
  }

  const sandpackTemplate = isSolid
    ? 'vanilla-ts'
    : isSvelte
      ? ('vite' as any)
      : (template as any);

  return (
    <Sandpack
      files={files}
      template={sandpackTemplate}
      theme={theme}
      options={{
        showTabs,
        resizablePanels: false,
        editorHeight: height || undefined,
      }}
      customSetup={isSvelte ? {} : { dependencies }}
    />
  );
}
