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


function generateBoard() {
  const size = BOARD_SIZE*BOARD_SIZE;
  const board: BoardCaseProps[] = [];

  let odd = false;

  for (let i = 1; i <= size ; i++)  {
    if(i % BOARD_SIZE != 1) {
      odd = !odd
    }
    board.push({odd, id: String(i)})
  }
  return board;
}

function generatePieces(board: BoardCaseProps[]) {
  const size = BOARD_SIZE*BOARD_SIZE;
  const pieces: (PieceProps|null)[] = [];

  const piecesRows = [
    0,
    1,
    2,
    BOARD_SIZE-3,
    BOARD_SIZE-2,
    BOARD_SIZE-1,
  ]

  for (let i = 0; i < size ; i++)  {
    const boardPiece = board[i];
    // use i+1 to calculate mod starting at 1, not 0;
    const rowNumber = Math.floor(i/BOARD_SIZE) % BOARD_SIZE;
    if(boardPiece.odd && piecesRows.includes(rowNumber)) {
      const odd = i >= size/2;

      pieces.push({odd, id: String(i), position: i})
    } else {
      pieces.push(null)
    }
  }

  return pieces;
}

const CheckersGame = () => {
  const [board] = useState(generateBoard)
  const [pieces] = useState(() => generatePieces(board))

  return (
    <DndContext>
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', maxWidth: CASE_SIZE * BOARD_SIZE}}>
        {board.map( (boardCase, index) => {
          const piece = pieces[index];
          const pieceMarkup = piece && piece.position === index ?
              <Piece {...piece} /> 
              : null;

          return (
            <BoardCase key={boardCase.id} {...boardCase}>
            {pieceMarkup}
            </BoardCase> 
          )
        })}
      </div>
    </DndContext>
  )

  // function handleDragEnd(event: DragEndEvent) {
  //   if(event?.over?.id != null) {
  //     const droppedId = event?.over?.id;
  //     const piece = board.find(({id}) => id === Number(droppedId))
  //   }
  // }
}

interface BoardCaseProps {
  odd: boolean
  id: string;
  children?: React.ReactElement | null;
}
const BoardCase = ({odd, id, children}: BoardCaseProps) => {
  const {setNodeRef, } = useDroppable({
    id
  });

  const backgroundColor = odd ? 'black' : 'white';

  return <div ref={setNodeRef} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: CASE_SIZE, width: CASE_SIZE, backgroundColor}}>
    {children}
  </div>
}

interface PieceProps {
  odd: boolean;
  id: string;
  position?: number;
}
const Piece = ({odd, id}: PieceProps) => {
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
