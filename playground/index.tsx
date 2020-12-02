import 'react-app-polyfill/ie11';
import * as React from 'react';
import {useMemo, useState} from 'react';
import * as ReactDOM from 'react-dom';

import {
  DndContext,
  useDraggable,
  useDroppable,
  UniqueIdentifier,
  DragEndEvent,
} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';


const Playground = () => {
  const containers = ['A', 'B', 'C'];
  const [parent, setParent] = useState<UniqueIdentifier | null>(null);

  const item = <Draggable />;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {parent === null ? item : null}

      <div style={{display: 'flex'}}>
        {containers.map((id) => (
          <Droppable key={id} id={id}>
            {parent === id ? item : 'Drop here'}
          </Droppable>
        ))}
      </div>
    </DndContext>
  );

  function handleDragEnd(event: DragEndEvent) {
    const {over} = event;

    setParent(over ? over.id : null);
  }
};

function Draggable() {
  const {
    attributes,
    isDragging,
    transform,
    setNodeRef,
    listeners,
  } = useDraggable({
    id: 'draggable-item',
  });

  return (
    <button
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        boxShadow: isDragging
          ? '-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
          : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      Drag me
    </button>
  );
}

interface DroppableProps {
  children: React.ReactNode;
  id: string;
}

function Droppable({id, children}: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({id});

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 150,
        border: '1px solid',
        margin: 20,
        borderColor: isOver ? '#4c9ffe' : '#EEE',
      }}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

const CASE_SIZE = 60;
const PIECE_SIZE = CASE_SIZE - 20;
const BOARD_SIZE = 8;

interface PieceProps{
  isOdd: boolean
  id: number;
}
function generateBoard(size = BOARD_SIZE*BOARD_SIZE) {
  const board: PieceProps[] = [];

  let isOdd = false;

  for (let i = 1; i <= size ; i++)  {
    if(i % BOARD_SIZE != 1) {
      isOdd = !isOdd
    }
    board.push({isOdd, id: i})
  }

  return board;
}

const CheckersGame = () => {
  const board = generateBoard();

  return (
    <DndContext>
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', maxWidth: CASE_SIZE * BOARD_SIZE}}>
        {board.map( ({id, isOdd}, index) => 
          <Case key={id} id={index} odd={isOdd}>
            <Piece id={id} />
          </Case>
        )}
      </div>
    </DndContext>
  )
}

const Case = ({odd=false, id, children}: any) => {
  const {setNodeRef} = useDroppable({
    id
  });

  const backgroundColor = odd ? 'black' : 'white';

  return <div ref={setNodeRef} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: CASE_SIZE, width: CASE_SIZE, backgroundColor}}>
    {children}
  </div>
}

const Piece = ({odd=false, id}: any) => {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id
  });

  const backgroundColor = odd ? '#4c4cff' : '#ff4c4c';
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return <div {...listeners} {...attributes}
    ref={setNodeRef}
    style={{width: PIECE_SIZE, height: PIECE_SIZE, backgroundColor, borderRadius: PIECE_SIZE/2, ...style}}
    />
}

ReactDOM.render(<CheckersGame />, document.getElementById('root'));
