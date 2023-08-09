import React from 'react';
import {Story, Unstyled} from '@storybook/blocks';
import {type StoryFn} from '@storybook/react';

import styles from './Preview.module.css';

interface Props {
  of?: StoryFn;
  children?: React.ReactNode;
}

export function Preview({children, of}: Props) {
  return (
    <Unstyled>
      <div className={styles.Preview}>{children ?? <Story of={of} />}</div>
    </Unstyled>
  );
}
