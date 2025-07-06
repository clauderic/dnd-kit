import './Dropzone.css';
import { ParentProps, splitProps } from 'solid-js';

interface DropzoneProps extends ParentProps {
  ref?: (el: HTMLDivElement) => void;
  highlight?: boolean;
}

export function Dropzone(props: DropzoneProps) {
  const [local, rest] = splitProps(props, ['ref', 'highlight', 'children']);
  return (
    <div
      ref={local.ref}
      class="Dropzone"
      data-highlight={local.highlight}
      {...rest}
    >
      {local.children}
    </div>
  );
}