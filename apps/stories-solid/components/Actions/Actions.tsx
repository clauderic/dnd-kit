import styles from './Actions.module.css';
import { JSX } from 'solid-js';

export function Actions(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return <div class={styles.Actions}>{props.children}</div>;
}
