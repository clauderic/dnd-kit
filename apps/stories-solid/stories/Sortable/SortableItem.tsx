import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {useSortable} from '@dnd-kit/solid/sortable';

interface SortableItemProps {
  id: UniqueIdentifier;
  index: number;
  layout?: 'vertical' | 'horizontal' | 'grid';
}

export function SortableItem(props: SortableItemProps) {
  const {isDragging, ref} = useSortable({
    id: props.id,
    index: props.index,
  });

  const style = () => {
    const s: Record<string, string> = {};
    if (props.layout === 'horizontal') {
      s['min-width'] = '100px';
      s['justify-content'] = 'center';
    }
    if (props.layout === 'grid') {
      s.height = '100%';
      s['justify-content'] = 'center';
    }
    return s;
  };

  return (
    <div ref={ref} class="Item" data-shadow={isDragging} style={style()}>
      {props.id}
    </div>
  );
}
