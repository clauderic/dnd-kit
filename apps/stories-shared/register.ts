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
