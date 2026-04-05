/**
 * Registers the <code-sandbox> custom HTML element and handles
 * mounting/unmounting across Astro view transitions.
 *
 * Mintlify-generated MDX renders <code-sandbox> tags with serialised
 * props as attributes. This script bridges those to our CodeSandbox
 * React component and ensures Sandpack's CSS-in-JS styles are injected.
 */
import { createRoot, type Root } from 'react-dom/client';
import { getSandpackCssText } from '@codesandbox/sandpack-react';
import { CodeSandbox } from './CodeSandbox';

const STYLE_ID = 'sandpack-styles';

function injectStyles() {
  const existing = document.getElementById(STYLE_ID);
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = getSandpackCssText();
  document.head.appendChild(style);
}

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

function unmount(el: HTMLElement) {
  const root: Root | undefined = (el as any).__root;
  if (root) {
    try { root.unmount(); } catch {}
    delete (el as any).__root;
  }
}

// Register the custom element (no-ops — lifecycle handled via Astro events)
if (!customElements.get('code-sandbox')) {
  customElements.define('code-sandbox', class extends HTMLElement {});
}

// Unmount before Astro swaps the page
document.addEventListener('astro:before-swap', () => {
  document.querySelectorAll('code-sandbox').forEach((el) => unmount(el as HTMLElement));
});

// Mount after Astro loads the new page (handles both initial + navigation).
// Use requestIdleCallback to run after React hydration completes.
document.addEventListener('astro:page-load', () => {
  const run = () => {
    const sandboxes = document.querySelectorAll('code-sandbox');
    if (sandboxes.length > 0) {
      injectStyles();
      sandboxes.forEach((el) => mount(el as HTMLElement));
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(run);
  } else {
    setTimeout(run, 100);
  }
});
