import './Item.css';

export class Item extends HTMLElement {
  connectedCallback() {
    this.classList.add('Item');
  }
}
