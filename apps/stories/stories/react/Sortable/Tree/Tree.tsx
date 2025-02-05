import {useState} from 'react';
import {DragDropProvider, DragOverlay} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';

import {FlattenedItem, type Item} from './types.js';
import {
  flattenTree,
  buildTree,
  getProjection,
  getDragDepth,
} from './utilities.js';
import {TreeItem} from './TreeItem.js';

import styles from './Tree.module.css';
import {TreeItemOverlay} from './TreeItemOverlay.tsx';

interface Props {
  items: Item[];
  indentation?: number;
  onChange(items: Item[]): void;
}

export function Tree({items, indentation = 50, onChange}: Props) {
  const [flattenedItems, setFlattenedItems] = useState<FlattenedItem[]>(() =>
    flattenTree(items)
  );
  const [initialDepth, setInitialDepth] = useState(0);

  return (
    <DragDropProvider
      onDragStart={(event) => {
        const {source} = event.operation;
        const initialDepth = flattenedItems.find(
          ({id}) => id === source!.id
        )!.depth;

        setInitialDepth(initialDepth);
      }}
      onDragOver={(event, manager) => {
        const {source, target} = event.operation;

        event.preventDefault();

        if (source && target && source.id !== target.id) {
          setFlattenedItems((flattenedItems) => {
            const sortedItems = move(flattenedItems, event);
            const offsetLeft = manager.dragOperation.transform.x;
            const dragDepth = getDragDepth(offsetLeft, indentation);
            const projectedDepth = initialDepth + dragDepth;
            const {depth, parentId} = getProjection(
              sortedItems,
              target.id,
              projectedDepth
            );

            return sortedItems.map((item) =>
              item.id === source.id ? {...item, depth, parentId} : item
            );
          });
        }
      }}
      onDragMove={(event, manager) => {
        if (event.defaultPrevented) {
          return;
        }

        const {source, target} = event.operation;

        if (source && target) {
          let keyboardDepth;
          const currentDepth = source.data!.depth ?? 0;

          // if (isKeyboardEvent(event.operation.activatorEvent)) {
          //   const isHorizontal = event.by?.x !== 0 && event.by?.y === 0;

          //   if (isHorizontal) {
          //     event.preventDefault();

          //     keyboardDepth = currentDepth + Math.sign(event.by!.x) * 1;
          //   }
          // }

          const offsetLeft = manager.dragOperation.transform.x;
          const dragDepth = getDragDepth(offsetLeft, indentation);

          const projectedDepth = keyboardDepth ?? initialDepth + dragDepth;
          console.log({initialDepth, projectedDepth});

          const {depth, parentId} = getProjection(
            flattenedItems,
            source.id,
            projectedDepth
          );

          // if (isKeyboardEvent(event.operation.activatorEvent)) {
          //   if (currentDepth !== depth) {
          //     requestAnimationFrame(() => {
          //       manager.actions.move({
          //         by: {x: indentation, y: 0},
          //       });
          //     });
          //   }
          // }

          if (
            source.data!.depth !== depth ||
            source.data!.parentId !== parentId
          ) {
            setFlattenedItems((flattenedItems) => {
              return flattenedItems.map((item) =>
                item.id === source.id ? {...item, depth, parentId} : item
              );
            });
          }
        }
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          return setFlattenedItems(flattenTree(items));
        }

        onChange(buildTree(flattenedItems));
      }}
    >
      <ul className={styles.Tree}>
        {flattenedItems.map((item, index) => (
          <TreeItem
            key={item.id}
            {...item}
            index={index}
            onRemove={console.log}
          />
        ))}
      </ul>
      <DragOverlay>
        {(source) => <TreeItemOverlay id={source.id} />}
      </DragOverlay>
    </DragDropProvider>
  );
}
