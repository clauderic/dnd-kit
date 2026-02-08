import './Container.css';

export class Container extends HTMLElement {
  connectedCallback() {
    this.classList.add('Container');
  }
}
