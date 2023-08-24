import iconSrc from '../../assets/droppableIcon.svg';
import styles from './Dropzone.module.css';

export class Dropzone extends HTMLElement {
  connectedCallback() {
    const image = document.createElement('img');
    image.src = iconSrc;
    this.classList.add(styles.Dropzone);
    this.appendChild(image);
  }
}
