import {Button, Container, Dropzone, Handle, Item} from './components/index.ts';

if (!customElements.get('button-component')) {
  customElements.define('button-component', Button);
}

if (!customElements.get('container-component')) {
  customElements.define('container-component', Container);
}

if (!customElements.get('dropzone-component')) {
  customElements.define('dropzone-component', Dropzone);
}

if (!customElements.get('handle-component')) {
  customElements.define('handle-component', Handle);
}

if (!customElements.get('item-component')) {
  customElements.define('item-component', Item);
}

// Apply dark mode and hero classes from URL query parameters.
// This is used when stories are embedded as iframes in the docs site.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
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
