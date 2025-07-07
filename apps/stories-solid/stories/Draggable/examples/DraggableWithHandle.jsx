import { useDraggable } from '@dnd-kit/solid';

export function Draggable(props) {
  const {ref, handleRef} = useDraggable({
    id: props.id,
  });

  return (
    <button 
      class="flex gap-2 items-center py-2 pr-4 pl-2 text-gray-800 bg-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-200" 
      ref={ref}
    >
      <span class="p-1 text-gray-600 rounded-md size-6 hover:bg-gray-400/20 cursor-grab" ref={handleRef}>
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
        </svg>
      </span>
      
      Draggable
    </button>
  );
}
