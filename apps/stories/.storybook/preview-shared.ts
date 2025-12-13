import {Button, Dropzone, Item} from '../shared/components';

/**
 * Register shared web components.
 * Call this in your preview file.
 */
export function registerWebComponents(): void {
  if (typeof customElements === 'undefined') {
    return;
  }

  if (!customElements.get('button-component')) {
    customElements.define('button-component', Button);
  }
  if (!customElements.get('dropzone-component')) {
    customElements.define('dropzone-component', Dropzone);
  }
  if (!customElements.get('item-component')) {
    customElements.define('item-component', Item);
  }
}

/**
 * Setup dark mode based on URL parameters.
 * Call this on mount in your preview decorator.
 */
export function setupDarkMode(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const dark = params.get('dark');
    const hero = params.get('hero');

    if (dark === 'false') {
      document.body.classList.remove('dark');
    } else if (dark === 'true') {
      document.body.classList.add('dark');
    }

    if (hero === 'true') {
      document.body.classList.add('hero');
    }
  }
}

/**
 * Shared dark mode parameters for Storybook.
 */
export const sharedParameters = {
  darkMode: {
    stylePreview: true,
  },
};
