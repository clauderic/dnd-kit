import styles from './Actions.module.css';
import { JSX, splitProps } from 'solid-js';
import { classNames } from '@/utilities';

export interface ActionProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'light' | 'dark' | 'destructive';
  cursor?: string;
}

export function Action(props: ActionProps) {
  const [local, rest] = splitProps(props, [
    'class',
    'style',
    'variant',
    'cursor',
    'ref',
    'children',
  ]);

  const style = () => ({
    ...((typeof local.style === 'object' && local.style !== null) ? local.style : {}),
    cursor: local.cursor,
  });

  return (
    <button
      ref={local.ref}
      {...rest}
      class={classNames(styles.Action, styles[local.variant || 'light'], local.class)}
      style={style()}
    >
      {local.children}
    </button>
  );
}
