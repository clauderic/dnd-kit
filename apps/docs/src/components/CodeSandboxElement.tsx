/**
 * Registers the <code-sandbox> custom HTML element and handles
 * mounting/unmounting across Astro view transitions.
 *
 * Uses unstyled Sandpack + standalone CodeMirror — no stitches,
 * no getSandpackCssText(), no dynamic style injection.
 */
import { createRoot, type Root } from 'react-dom/client';
import { CodeSandbox } from './CodeSandbox';

function mount(el: HTMLElement) {
  if ((el as any).__root) return;

  let files = {};
  try { files = JSON.parse(el.getAttribute('files') || '{}'); } catch {}

  const height = parseInt(el.getAttribute('height') || '0') || undefined;
  const showTabs = Boolean(el.getAttribute('showTabs'));
  const template = el.getAttribute('template') || 'react';

  el.innerHTML = '';
  const root = createRoot(el);
  (el as any).__root = root;
  root.render(
    <CodeSandbox
      files={files}
      height={height}
      showTabs={showTabs}
      template={template}
    />,
  );
}

// Register inert custom element
if (!customElements.get('code-sandbox')) {
  customElements.define('code-sandbox', class extends HTMLElement {});
}

// Unmount before Astro swaps the page
document.addEventListener('astro:before-swap', () => {
  document.querySelectorAll('code-sandbox').forEach((el) => {
    const root: Root | undefined = (el as any).__root;
    if (root) {
      try { root.unmount(); } catch {}
      delete (el as any).__root;
    }
  });
});

// Mount after page load — delay on initial load to avoid hydration conflicts
let initialLoad = true;

document.addEventListener('astro:page-load', () => {
  const mountAll = () => {
    document.querySelectorAll('code-sandbox').forEach((el) => mount(el as HTMLElement));
  };

  if (initialLoad) {
    initialLoad = false;
    // Wait for React hydration to complete before touching the DOM
    setTimeout(mountAll, 0);
  } else {
    mountAll();
  }
});
