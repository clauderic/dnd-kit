import React from 'react';
import {Unstyled} from '@storybook/blocks';

import {CodeHighlighter} from './components';
import styles from './Code.module.css';

interface Props {
  children: string;
}

export function Code(props: Props) {
  const {children} = props;

  return children.includes('\n') ? (
    <Unstyled>
      <div className={styles.Code}>
        <div className={styles.TabContent} role="tabpanel">
          <CodeHighlighter>{children}</CodeHighlighter>
        </div>
      </div>
    </Unstyled>
  ) : (
    <code>{children}</code>
  );
}
