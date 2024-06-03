import React, {type PropsWithChildren} from 'react';

import styles from './Actions.module.css';

export function Actions(props: PropsWithChildren) {
  return <div className={styles.Actions}>{props.children}</div>;
}
