import {useSortable} from '@dnd-kit/react/sortable';

import {Handle} from '../../components/Handle/Handle.tsx';
import {Remove} from '../../components/Actions/Remove.tsx';

import {FlattenedItem} from './types.ts';
import styles from './Tree.module.css';

export interface Props extends FlattenedItem {
  onRemove?(): void;
}

const INDENTATION = 50;

const config = {
  alignment: {
    x: 'start',
    y: 'center',
  },
  transition: {
    idle: true,
  },
} as const;

export function TreeItem({depth, id, index, parentId, onRemove}: Props) {
  const {ref, handleRef, isDragSource} = useSortable({
    ...config,
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
      <span className={styles.Handle}>
        <Handle ref={handleRef} />
      </span>
      {id}
      {onRemove && (
        <div className={styles.Action}>
          <Remove onClick={onRemove} />
        </div>
      )}
    </li>
  );
}
