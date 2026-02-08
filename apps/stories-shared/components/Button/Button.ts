import './Button.css';

export class Button extends HTMLElement {
  connectedCallback() {
    this.classList.add('Button');
  }
}
