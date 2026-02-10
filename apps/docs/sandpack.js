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
    const sharedDependencies = {
      "@dnd-kit/helpers": "beta",
    }
    const templateDependencies = {
      react: {"@dnd-kit/react": "beta"},
      vue: {"@dnd-kit/vue": "beta"},
      solid: {"@dnd-kit/solid": "beta"},
    };
    const dependencies = {
      ...sharedDependencies,
      ...(templateDependencies[template] || {"@dnd-kit/dom": "beta"}),
    };

    try {
      files = JSON.parse(this.getAttribute("files"));
    } catch {}

    // The classic Sandpack "solid" bundler environment has a bug where its
    // internal babel-preset-solid generates _$$component() dev-mode wrappers,
    // but resolves solid-js/web to the production build which doesn't export
    // that function. To work around this, we use Vite + Nodebox for Solid
    // examples, which properly compiles Solid JSX and resolves conditional
    // exports.
    if (isSolid) {
      const solidInfraFiles = {
        '/index.html': {
          code: \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solid App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/index.tsx"><\\/script>
</body>
</html>\`,
          hidden: true,
        },
        '/index.tsx': {
          code: 'import { render } from "solid-js/web";\\nimport App from "./App";\\nrender(() => <App />, document.getElementById("app"));',
          hidden: true,
        },
        '/vite.config.ts': {
          code: 'import { defineConfig } from "vite";\\nimport solidPlugin from "vite-plugin-solid";\\nexport default defineConfig({ plugins: [solidPlugin()] });',
          hidden: true,
        },
        '/package.json': {
          code: JSON.stringify({
            scripts: { dev: "vite" },
            dependencies: {
              "solid-js": "^1.9.0",
            },
            devDependencies: {
              "vite": "4.2.0",
              "vite-plugin-solid": "^2.10.0",
              "esbuild-wasm": "0.17.12",
            },
          }),
          hidden: true,
        },
      };
      files = { ...solidInfraFiles, ...files };
    }

    const sandpackComponent = React.createElement(Sandpack, {
      files,
      template: isSolid ? undefined : template,
      theme,
      options: {
        showTabs,
        resizablePanels: false,
        editorHeight: height || undefined,
      },
      customSetup: isSolid
        ? { environment: "node", dependencies }
        : { dependencies },
    }, null);
    root.render(sandpackComponent);
  }
}

customElements.define("code-sandbox", SandpackElement);
`;

script.type = 'module';
script.textContent = code;

document.head.appendChild(script);
