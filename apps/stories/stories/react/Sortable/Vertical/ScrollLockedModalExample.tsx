import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import {SortableExample} from '../SortableExample';

export function ScrollLockedModalExample() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const {body, documentElement} = document;
    const bodyStyle = body.style.cssText;
    const rootStyle = documentElement.style.cssText;
    body.style.height = '100vh';
    body.style.contain = 'none';
    documentElement.style.overflow = 'visible';
    documentElement.style.contain = 'none';

    return () => {
      body.style.cssText = bodyStyle;
      documentElement.style.cssText = rootStyle;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const {body} = document;
    const overflow = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = overflow;
    };
  }, [open]);

  return (
    <>
      <div style={{height: '250vh'}}>
        Scroll the page before opening the modal.
      </div>
      <button
        style={{position: 'fixed', top: 20, left: 20}}
        onClick={() => setOpen(true)}
      >
        Open modal
      </button>
      {open &&
        createPortal(
          <section
            role="dialog"
            aria-label="Sortable modal"
            style={{
              position: 'fixed',
              bottom: 24,
              left: 40,
              right: 40,
              background: 'white',
            }}
          >
            <button onClick={() => setOpen(false)}>Close modal</button>
            <SortableExample
              itemCount={2}
              dragHandle
              optimistic={false}
              transition={null}
            />
          </section>,
          document.body
        )}
    </>
  );
}
