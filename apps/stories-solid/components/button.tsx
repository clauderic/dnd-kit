import { JSX } from 'solid-js';

export function Button(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{props.children}</button>;
}