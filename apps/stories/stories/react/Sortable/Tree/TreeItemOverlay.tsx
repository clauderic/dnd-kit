import type {UniqueIdentifier} from '@dnd-kit/abstract';

import {Handle} from '../../components';

import styles from './Tree.module.css';

interface Props {
  id: UniqueIdentifier;
}

export function TreeItemOverlay({id}: Props) {
  return (
    <div className={styles.TreeItem} data-overlay>
      <Handle />
      {id}
    </div>
  );
}
