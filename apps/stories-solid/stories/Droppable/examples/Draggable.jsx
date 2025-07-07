import {useDraggable} from '@dnd-kit/solid';

export function Draggable({id}) {
  const {ref} = useDraggable({
    id,
  });

  return (
    <button ref={ref}>
      Draggable
    </button>
  );
}
