import styles from './Button.module.css';

export class Button extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.classList.add(styles.Button);
  }
}
