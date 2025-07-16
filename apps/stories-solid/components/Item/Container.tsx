import styles from './Container.module.css';
import { JSX, splitProps, mergeProps, createEffect } from 'solid-js';

interface ContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  actions?: JSX.Element;
  columns?: number;
  label?: string;
  scrollable?: boolean;
  shadow?: boolean;
  style?: JSX.CSSProperties;
  transitionId?: string;
  children?: JSX.Element;
  ref?: (el: HTMLDivElement) => void;
}

export function Container(props: ContainerProps) {
  const [local, rest] = splitProps(props, [
    'actions',
    'columns',
    'label',
    'scrollable',
    'shadow',
    'style',
    'transitionId',
    'children',
    'ref',
  ]);

  return (
    <div
      {...rest}
      ref={local.ref}
      style={{
        ...local.style,
        'view-transition-name': local.transitionId,
        '--columns': local.columns ?? 1,
      }}
      classList={{
        [styles.Container]: true,
        [styles.scrollable]: !!local.scrollable,
        [styles.shadow]: !!local.shadow,
      }}
    >
      {local.label ? (
        <div class={styles.Header}>
          {local.label}
          {local.actions}
        </div>
      ) : null}
      <ul id={local.label}>{local.children}</ul>
    </div>
  );
} 