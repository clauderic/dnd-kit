import {createSignal, For} from 'solid-js';
import {DragDropProvider} from '@dnd-kit/solid';
import {move} from '@dnd-kit/helpers';
import {createRange} from '@dnd-kit/stories-shared/utilities';
import {SortableItem} from './SortableItem';

interface SortableExampleProps {
  layout?: 'vertical' | 'horizontal' | 'grid';
  itemCount?: number;
}

export function SortableExample(props: SortableExampleProps) {
  const layout = () => props.layout ?? 'vertical';
  const itemCount = () => props.itemCount ?? 15;
  const [items, setItems] = createSignal(createRange(itemCount()));

  const wrapperStyle = () => {
    const base = {gap: '18px', padding: '0 30px'};

    switch (layout()) {
      case 'grid':
        return {
          ...base,
          display: 'grid',
          'max-width': '900px',
          'margin-inline': 'auto',
          'grid-template-columns': 'repeat(auto-fill, 150px)',
          'grid-auto-flow': 'dense',
          'grid-auto-rows': '150px',
          'justify-content': 'center',
        };
      case 'horizontal':
        return {
          ...base,
          display: 'inline-flex',
          'flex-direction': 'row',
          'align-items': 'stretch',
          height: '180px',
        };
      case 'vertical':
      default:
        return {
          ...base,
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'center',
        };
    }
  };

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <div style={wrapperStyle()}>
        <For each={items()}>
          {(id, index) => (
            <SortableItem id={id} index={index()} layout={layout()} />
          )}
        </For>
      </div>
    </DragDropProvider>
  );
}
