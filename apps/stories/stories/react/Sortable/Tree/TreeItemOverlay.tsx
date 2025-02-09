import type {UniqueIdentifier} from '@dnd-kit/abstract';

import {Handle} from '../../components/Handle/Handle.tsx';
import styles from './Tree.module.css';

interface Props {
  id: UniqueIdentifier;
  count: number;
}

export function TreeItemOverlay({id, count}: Props) {
  return (
    <div className={styles.TreeItem} data-overlay>
      <Handle />
      {id}
      {count > 0 ? <span className={styles.Badge}>{count}</span> : null}
    </div>
  );
}
