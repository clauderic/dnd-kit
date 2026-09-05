import {useState} from 'react';

import type {NestedTrace} from './trace.ts';
import styles from './Nested.module.css';

export function TraceControls({trace}: {trace: NestedTrace}) {
  const [status, setStatus] = useState('');
  const [fallback, setFallback] = useState('');

  async function copy() {
    const snapshot = trace.snapshot();
    if (!snapshot.initial) {
      setStatus('Drag something first, then copy the trace.');
      return;
    }
    const text = trace.export();
    try {
      await navigator.clipboard.writeText(text);
      setFallback('');
      setStatus(
        `Copied ${snapshot.events.length} events. Paste the trace into the conversation.`
      );
    } catch {
      setFallback(text);
      setStatus(
        'Clipboard access is unavailable. Select and copy the trace below.'
      );
    }
  }

  return (
    <div className={styles.TraceControls}>
      <button
        type="button"
        className={`${styles.Reset} ${styles.CopyTrace}`}
        onClick={copy}
        title="After flickering, release the pointer and copy the latest drag trace."
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="7" y="6" width="9" height="11" rx="2" />
          <path d="M12 6V4a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v7a1 1 0 0 0 1 1h3" />
        </svg>
        Copy trace
      </button>
      {status && (
        <div className={styles.TraceMessage}>
          <p role="status" aria-label="Trace export">
            {status}
          </p>
          {fallback && (
            <textarea
              aria-label="Drag trace JSON"
              readOnly
              value={fallback}
              onFocus={(event) => event.currentTarget.select()}
              onClick={(event) => event.currentTarget.select()}
            />
          )}
          <button
            type="button"
            onClick={() => {
              setStatus('');
              setFallback('');
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
