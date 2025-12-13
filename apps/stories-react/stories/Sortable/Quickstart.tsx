import {useSortable} from '@dnd-kit/react/sortable';

export function Sortable({id, index}: {id: number; index: number}) {
  const {ref} = useSortable({id, index});

  return <li ref={ref}>Item {id}</li>;
}

export function QuickstartExample() {
  const items = [1, 2, 3, 4];

  return (
    <ul className="list">
      {items.map((id, index) => (
        <Sortable key={id} id={id} index={index} />
      ))}
    </ul>
  );
}
