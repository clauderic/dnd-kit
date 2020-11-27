import React from 'react';
import classNames from 'classnames';

import styles from './FloatingControls.module.css';

export interface Props {
  children: React.ReactNode;
}

export function FloatingControls({children}: Props) {
  return <div className={classNames(styles.FloatingControls)}>{children}</div>;
}
