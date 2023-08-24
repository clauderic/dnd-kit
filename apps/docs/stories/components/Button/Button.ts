import styles from './Button.module.css';

export class Button extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    if (!this.querySelector('button')) {
      this.tabIndex = 1;
    }

    this.classList.add(styles.Button);
  }
}
