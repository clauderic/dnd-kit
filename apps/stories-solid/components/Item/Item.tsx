import './Item.css';
import { JSX, splitProps, mergeProps, createEffect } from 'solid-js';
import { Dynamic } from 'solid-js/web';

interface ItemProps extends JSX.HTMLAttributes<HTMLElement> {
  actions?: JSX.Element;
  accentColor?: string;
  shadow?: boolean;
  transitionId?: string;
  children?: JSX.Element;
  as?: 'div' | 'button';
  ref?: (el: HTMLElement) => void;
}

export function Item(props: ItemProps) {
  const [local, rest] = splitProps(props, [
    'accentColor',
    'shadow',
    'transitionId',
    'children',
    'as',
    'style',
    'ref',
  ]);
  
  const style = () => typeof local.style === 'object' && local.style !== null ? local.style : {};
  
  return (
    <Dynamic
      component={local.as || 'div'}
      class="Item"
      data-shadow={local.shadow}
      data-accent-color={local.accentColor}
      style={{
        ...style(),
        'view-transition-name': local.transitionId,
        '--accent-color': local.accentColor,
      }}
      ref={local.ref}
      {...rest}
    >
      {local.children}
    </Dynamic>
  );
}