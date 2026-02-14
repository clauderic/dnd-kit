import React, {useEffect, useMemo, useRef} from 'react';
import Prism from 'prismjs';
import Clipboard from 'clipboard';
import 'prismjs/components/prism-jsx.min';

import copy from './copy.svg';
import styles from './CodeHighlighter.module.css';
import {classNames, createRange} from '@dnd-kit/stories-shared/utilities';

interface Props {
  children: string;
  language?: string;
}

export function CodeHighlighter({children = '', language = 'jsx'}: Props) {
  const lineCount = children.split('\n').length - 1;
  const nodeRef = useRef<HTMLButtonElement>(null);
  const highlightedCode = useMemo(
    () =>
      syntaxReplacements(
        Prism.highlight(
          children.trim(),
          Prism.languages[language] ?? Prism.languages.txt,
          language
        )
      ),
    [children]
  );

  useEffect(() => {
    const clipboard = new Clipboard(nodeRef.current as Element);
    return () => clipboard.destroy();
  }, []);

  return (
    <div
      className={classNames(styles.CodeHighlighter, 'sb-unstyled', language)}
    >
      <pre>
        <div aria-hidden="true" className={styles.LineNumbers}>
          {lineCount > 1
            ? createRange(lineCount).map((line) => (
                <React.Fragment key={line}>
                  {line}
                  <br />
                </React.Fragment>
              ))
            : null}
        </div>
        <code dangerouslySetInnerHTML={{__html: highlightedCode}} />
      </pre>
      <button
        className={styles.Copy}
        ref={nodeRef}
        data-clipboard-text={children}
      >
        <img src={copy} width="19" height="20" alt="Copy" />
      </button>
    </div>
  );
}

function syntaxReplacements(value: string) {
  const markup = (string, newAttribute = '') =>
    `<span class="token ${newAttribute}">${string}</span>`;
  const replacements = [
    ['const', 'token', 'const'],
    ['null', 'token', 'null'],
    ['function', 'token', 'function'],
    ['[(]', 'punctuation', 'parentheses opening', '('],
    ['[)]', 'punctuation', 'parentheses closing', ')'],
    ['{', 'punctuation', 'braces opening'],
    ['}', 'punctuation', 'braces closing'],
    [';', 'punctuation', 'semicolon'],
    ['=>', 'operator', 'arrow-function'],
  ];

  return replacements.reduce(
    (accumulator, [value, label, annotation, replacement]) =>
      accumulator.replace(
        new RegExp(markup(value, label), 'g'),
        markup(replacement ?? value, `${label} ${annotation}`)
      ),
    value
  );
}
