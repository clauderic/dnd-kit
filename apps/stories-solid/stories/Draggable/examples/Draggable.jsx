import { useDraggable } from '@dnd-kit/solid';

export function Draggable(props) {
  const {ref} = useDraggable({
    id: props.id,
  });

  return (
    <button 
      class="flex gap-2 items-center px-4 py-2 text-gray-800 bg-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-200 cursor-grab" 
      ref={ref}
    >
      Draggable
    </button>
  );
}
