/**
 * Sandpack-powered interactive code editor.
 *
 * Uses unstyled SandpackProvider + SandpackPreview for the bundler/preview,
 * and a standalone CodeMirror editor (SandpackCodeEditor) for the code.
 * No stitches CSS-in-JS — all styling is in global.css and CM theme.
 */
import {
  SandpackProvider,
  SandpackPreview,
  type SandpackFiles,
} from '@codesandbox/sandpack-react/unstyled';
import { SandpackCodeEditor } from './SandpackCodeEditor';

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
    <SandpackProvider
      files={files}
      template={sandpackTemplate}
      customSetup={isSvelte ? {} : { dependencies }}
    >
      <div className="sp-layout">
        <div className="sp-preview sp-stack">
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
          />
        </div>
        <div className="sp-editor sp-stack">
          <SandpackCodeEditor height={height} />
        </div>
      </div>
    </SandpackProvider>
  );
}
