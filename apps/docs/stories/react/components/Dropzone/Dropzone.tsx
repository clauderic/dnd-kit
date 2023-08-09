import React, {forwardRef} from 'react';

import {classNames} from '../../../utilities';
import {DroppableIcon} from '../../icons';

import styles from './Dropzone.module.css';

interface Props {
  children: React.ReactNode;
  highlight?: boolean;
  lift?: boolean;
}

export const Dropzone = forwardRef<HTMLDivElement, Props>(function Dropzone(
  {children, lift, highlight},
  ref
) {
  return (
    <div
      ref={ref}
      className={classNames(
        styles.Dropzone,
        highlight && styles.highlight,
        lift && styles.lift,
        children && styles.dropped
      )}
      aria-label="Droppable region"
    >
      {children}
      <DroppableIcon />
    </div>
  );
});
