import React from 'react';
import {Story, Unstyled} from '@storybook/addon-docs/blocks';
import {type StoryFn} from '@storybook/react';

import {classNames} from '@dnd-kit/stories-shared/utilities';
import {Code} from '../Code';
import styles from './Preview.module.css';

interface Props {
  of?: StoryFn;
  code?: string;
  id?: string;
  hero?: boolean;
  tabs?: string[];
  children?: React.ReactNode;
}

export function Preview({children, code, of, hero, id, tabs}: Props) {
  return (
    <Unstyled>
      <div
        className={classNames(
          styles.Preview,
          hero && styles.hero,
          hero && 'hero'
        )}
        id={id}
      >
        {children ?? <Story of={of} />}
      </div>
      {code ? (
        <div className={styles.Code}>
          <Code tabs={tabs}>{code}</Code>
        </div>
      ) : null}
    </Unstyled>
  );
}
