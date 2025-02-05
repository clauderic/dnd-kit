import {useSortable} from '@dnd-kit/react/sortable';

import {directionBiased} from '@dnd-kit/collision';

import {Handle, Remove} from '../../components';

import {FlattenedItem} from './types.js';
import styles from './Tree.module.css';

export interface Props extends FlattenedItem {
  onRemove?(): void;
}

const INDENTATION = 50;

export function TreeItem({depth, id, index, parentId, onRemove}: Props) {
  const {ref, handleRef, isDragSource} = useSortable({
    collisionDetector: directionBiased,
    id,
    index,
    data: {
      depth,
      parentId,
    },
  });

  return (
    <li
      ref={ref}
      className={styles.TreeItem}
      style={{
        marginLeft: depth * INDENTATION,
      }}
      aria-hidden={isDragSource}
    >
      <Handle ref={handleRef} />
      {id}
      {onRemove && (
        <div className={styles.Action}>
          <Remove onClick={onRemove} />
        </div>
      )}
    </li>
  );
}
