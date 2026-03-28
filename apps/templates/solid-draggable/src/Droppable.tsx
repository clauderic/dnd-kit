import {useDroppable} from '@dnd-kit/solid';

export function Droppable(props) {
  const {ref, isDropTarget} = useDroppable({id: 'droppable'});

  return (
    <div ref={ref} class={isDropTarget() ? "droppable active" : "droppable"}>
      {props.children}
    </div>
  );
}
