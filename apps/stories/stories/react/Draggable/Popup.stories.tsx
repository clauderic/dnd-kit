import {useEffect, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';

function DraggableButton() {
  const {ref} = useDraggable({id: 'popup-draggable'});

  return (
    <button ref={ref} type="button" style={{padding: 20, touchAction: 'none'}}>
      Drag me
    </button>
  );
}

function PopupExample() {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        !popupRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [open]);

  return (
    <div style={{padding: 40}}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        Toggle popup
      </button>

      <p data-testid="completed-drags">{completed}</p>

      <DragDropProvider
        onDragEnd={(event) => {
          if (!event.canceled) {
            setCompleted((value) => value + 1);
          }
        }}
      >
        {open && (
          <div
            ref={popupRef}
            data-testid="popup"
            style={{
              width: 400,
              height: 240,
              padding: 32,
              marginTop: 20,
              border: '2px solid blue',
            }}
          >
            <DraggableButton />
          </div>
        )}
      </DragDropProvider>

      <button type="button" style={{marginTop: 24}}>
        Outside button
      </button>
    </div>
  );
}

const meta = {
  title: 'React/Draggable/Popup',
  component: PopupExample,
} satisfies Meta<typeof PopupExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {};
