const importMap = {
  imports: {
    react: 'https://esm.sh/react@19.2.3',
    'react/': 'https://esm.sh/react@19.2.3/',
    'react-dom': 'https://esm.sh/react-dom@19.2.3',
    'react-dom/': 'https://esm.sh/react-dom@19.2.3/',
    '@codesandbox/sandpack-react':
      'https://esm.sh/@codesandbox/sandpack-react@2.20.0?external=react,react-dom',
  },
};

const importMapScript = document.createElement('script');
importMapScript.type = 'importmap';
importMapScript.textContent = JSON.stringify(importMap);

document.head.appendChild(importMapScript);

const script = document.createElement('script');

const code = `
import React from "react";
import {createRoot} from "react-dom/client";
import {Sandpack} from "@codesandbox/sandpack-react";

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
    plain: '#d6deeb',
    comment: {
      color: '#999999',
    },
    keyword: {
      color: '#c792ea',
    },
    tag: '#569cd6',
    punctuation: '#d4d4d4',
    definition: '#dcdcaa',
    property: {
      color: '#9cdcfe',
    },
    static: '#f78c6c',
    string: '#ce9178',
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    mono: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
    size: '14px',
    lineHeight: '20px',
  },
};

class SandpackElement extends HTMLElement {
  connectedCallback() {
    const root = createRoot(this);
    let files = {};
    const height = parseInt(this.getAttribute("height"));
    const showTabs = Boolean(this.getAttribute("showTabs"));
    const template = this.getAttribute("template") || "react";
    const isSolid = template === "solid";
    const isSvelte = template === "svelte";
    const sharedDependencies = {
      "@dnd-kit/helpers": "beta",
    }
    const templateDependencies = {
      react: {"@dnd-kit/react": "beta"},
      vue: {"@dnd-kit/vue": "beta"},
      solid: {"@dnd-kit/solid": "beta"},
      svelte: {"@dnd-kit/svelte": "beta"},
    };
    const dependencies = {
      ...sharedDependencies,
      ...(templateDependencies[template] || {"@dnd-kit/dom": "beta"}),
    };

    try {
      files = JSON.parse(this.getAttribute("files"));
    } catch {}

    if (isSolid) {
      dependencies["solid-js"] = "^1.9.0";
      dependencies["babel-preset-solid"] = "latest";

      const solidInfraFiles = {
        '/index.html': {
          code: \`<!DOCTYPE html>
<html>
<head>
  <title>Solid Demo</title>
  <meta charset="UTF-8" />
</head>
<body>
  <div id="app"></div>
  <script src="src/index.js"><\\/script>
</body>
</html>\`,
          hidden: true,
        },
        '/index.ts': {
          code: 'import "./styles.css";\\nimport {render} from "solid-js/web";\\nimport App from "./App";\\n\\nrender(App, document.getElementById("app"));',
          hidden: true,
        },
        '/.babelrc': {
          code: JSON.stringify({presets: ["babel-preset-solid"]}, null, 2),
          hidden: true,
        },
        '/tsconfig.json': {
          code: JSON.stringify({compilerOptions: {jsx: "preserve", jsxImportSource: "solid-js", noEmit: true}}, null, 2),
          hidden: true,
        },
      };
      files = { ...solidInfraFiles, ...files };
    }

    if (isSvelte) {
      // Use the plain "vite" Nodebox template (Vite 4.1.4, Rollup 3, pure JS, no Svelte pre-cached).
      // vite-svelte has Svelte 3 pre-cached in Nodebox which overrides our package.json.
      // We provide all infra files and an inline svelte/compiler plugin instead of
      // @sveltejs/vite-plugin-svelte whose major version tracks Vite's major.
      const svelteInfraFiles = {
        '/package.json': {
          code: JSON.stringify({
            scripts: { dev: 'vite' },
            devDependencies: {
              svelte: '^5.0.0',
              '@dnd-kit/svelte': 'beta',
              '@dnd-kit/helpers': 'beta',
              vite: '4.1.4',
              'esbuild-wasm': '0.17.12',
            },
          }),
          hidden: true,
        },
        '/vite.config.js': {
          code: \`import { defineConfig } from 'vite';
import { compile } from 'svelte/compiler';

export default defineConfig({
  plugins: [{
    name: 'svelte',
    transform(code, id) {
      if (!id.endsWith('.svelte')) return null;
      const { js } = compile(code, { filename: id, generate: 'dom', css: 'injected' });
      return { code: js.code, map: js.map };
    },
  }],
});\`,
          hidden: true,
        },
        '/index.html': {
          code: \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Svelte Demo</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"><\\/script>
</body>
</html>\`,
          hidden: true,
        },
        '/src/main.js': {
          code: \`import { mount } from 'svelte';
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });\`,
          hidden: true,
        },
      };
      files = { ...svelteInfraFiles, ...files };
    }

    const sandpackComponent = React.createElement(Sandpack, {
      files,
      template: isSolid ? "vanilla-ts" : isSvelte ? "vite" : template,
      theme,
      options: {
        showTabs,
        resizablePanels: false,
        editorHeight: height || undefined,
      },
      customSetup: isSvelte ? {} : { dependencies },
    }, null);
    root.render(sandpackComponent);
  }
}

customElements.define("code-sandbox", SandpackElement);
`;

script.type = 'module';
script.textContent = code;

document.head.appendChild(script);
