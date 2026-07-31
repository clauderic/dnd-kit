import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';

function Draggable() {
  const {isDragging, ref} = useDraggable({id: 'draggable'});

  return (
    <button ref={ref} data-dnd-dragging={isDragging || undefined} type="button">
      Draggable
    </button>
  );
}

function DragDropProviderCleanup() {
  const [isMounted, setIsMounted] = useState(true);

  return (
    <div>
      <button onClick={() => setIsMounted((mounted) => !mounted)} type="button">
        {isMounted ? 'Unmount provider' : 'Mount provider'}
      </button>
      {isMounted ? (
        <DragDropProvider>
          <Draggable />
        </DragDropProvider>
      ) : (
        <p>Provider unmounted</p>
      )}
    </div>
  );
}

const meta: Meta<typeof DragDropProviderCleanup> = {
  title: 'React/DragDropProvider',
  component: DragDropProviderCleanup,
  tags: ['!autodocs', 'hidden'],
};

export default meta;
type Story = StoryObj<typeof DragDropProviderCleanup>;

export const Cleanup: Story = {};
