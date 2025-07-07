/** @jsxImportSource react */
import React, {useState} from 'react';
import {Unstyled} from '@storybook/addon-docs/blocks';

import {CodeHighlighter} from '@/components-docs/CodeHighlighter';
import styles from './Code.module.css';

interface Props {
  children: string | string[];
  tabs?: string[];
  className?: string;
}

export function Code(props: Props) {
  const {children, className} = props;
  const [selectedTab, setSelectedTab] = useState(0);
  const contents = Array.isArray(children) ? children[selectedTab] : children;

  return Array.isArray(children) || children.includes('\n') ? (
    <Unstyled>
      <div className={styles.Code}>
        {props.tabs ? (
          <div className={styles.Tabs} role="tablist">
            {props.tabs.map((tab, index) => (
              <button
                key={tab}
                className={styles.Tab}
                role="tab"
                aria-selected={index === selectedTab}
                onClick={() => setSelectedTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : null}
        <div className={styles.TabContent} role="tabpanel">
          <CodeHighlighter language={className?.replace('language-', '')}>
            {contents}
          </CodeHighlighter>
        </div>
      </div>
    </Unstyled>
  ) : (
    <code className={styles.InlineCode}>{children}</code>
  );
}
