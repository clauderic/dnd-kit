import {useDroppable} from '@dnd-kit/solid';

export function Droppable(props) {
  const { ref, isDropTarget } = useDroppable({ id: props.id });

  return (
    <div
      ref={ref}
      class={[
        'flex items-center justify-center w-[300px] h-[300px] border-[3px] rounded-[10px] transition-colors',
        isDropTarget
          ? 'bg-teal-300/15 border-teal-400'
          : 'bg-white border-black/10'
      ].join(' ')}
    >
      {props.children}
    </div>
  );
}
