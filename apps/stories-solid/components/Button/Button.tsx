import styles from './Button.module.css';

import { JSX } from 'solid-js';
import { classNames } from '@/utilities';

export function Button(props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { shadow?: boolean }) {
  return (
    <button 
      {...props} 
      class={classNames(styles.Button, props.class)}
      data-shadow={props.shadow}
    >
      {props.children}
    </button>
  );
}