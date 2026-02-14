import {Container, Item} from './components/index.ts';
import {baseStyles, draggableStyles, droppableStyles, handleStyles, sortableStyles, multipleListsStyles} from './styles/sandbox.ts';

// Inject shared styles globally for Storybook display
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = [baseStyles, draggableStyles, droppableStyles, handleStyles, sortableStyles, multipleListsStyles].join('\n');
  document.head.appendChild(style);
}

if (!customElements.get('container-component')) {
  customElements.define('container-component', Container);
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
