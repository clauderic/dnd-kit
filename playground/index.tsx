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
  DragStartEvent,
  DraggableClone,
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


// Game
const CASE_SIZE = 60;
const PIECE_SIZE = CASE_SIZE - 20;
const BOARD_SIZE = 8;


function generateBoard() {
  const board: BoardCaseProps[][] = Array.from(Array(BOARD_SIZE), () => new Array(BOARD_SIZE));

  let odd = false;

  for (let x = 0; x < BOARD_SIZE ; x++)  {
    for (let y = 0; y < BOARD_SIZE ; y++)  {
      if(y % BOARD_SIZE != 0) {
        odd = !odd
      }
      board[x][y] = ({odd, id: x + "-" + y})
    }
  }
  return board;
}

function generatePieces(board: BoardCaseProps[][]) {
  const pieces: (PieceProps|undefined)[][] = Array.from(Array(BOARD_SIZE), () => new Array(BOARD_SIZE));

  const piecesRows = [
    0,
    1,
    2,
    BOARD_SIZE-3,
    BOARD_SIZE-2,
    BOARD_SIZE-1,
  ]

  for (let x = 0; x < BOARD_SIZE ; x++)  {
    for (let y = 0; y < BOARD_SIZE ; y++)  {
      const boardCase = board[x][y];
      if(boardCase.odd && piecesRows.includes(x)) {
        const odd = x <= BOARD_SIZE/2;
        pieces[x][y] = {odd, id: x + "-" + y, position: {x, y}, disabled: false}
      }
    }
  }

  return pieces;
}

function checkEnd(pieces: (PieceProps | undefined)[][]): {oddWon: boolean, evenWon: boolean} {
  const result = {oddWon: true, evenWon: true};

  for (let x = 0; x < BOARD_SIZE ; x++)  {
    for (let y = 0; y < BOARD_SIZE ; y++)  {
      const piece = pieces[x][y];
      if (!piece) continue;
      if(piece.odd) {
        result.oddWon = false;
      } else {
        result.evenWon = false;
      }
    }
  }

  return result;
}

interface CanMoveProps {
  canMove: boolean;
  toRemove?: PieceProps;
}

const CheckersGame = () => {
  const [board] = useState(generateBoard)
  const [pieces, setPieces] = useState(() => generatePieces(board))
  const [movingPiece, setMovingPiece] = useState<PieceProps|null>(null)
  const [isOddTurn, setIsOddTurn] = useState(true)
  const [oddScore, setOddScore] = useState(0)
  const [evenScore, setEvenScore] = useState(0)

  const {evenWon, oddWon} = useMemo(() => checkEnd(pieces), [pieces]);

  const checkCanMove = React.useCallback(function (
      isOddTurn: boolean, 
      isOddPiece: boolean,
      movingPiece: PieceProps, 
      moveToX:number,
      moveToY:number,
    ): CanMoveProps {
      const {x: moveFromX, y: moveFromY} = movingPiece.position!
      
      const dx = moveToX - moveFromX;
      const dy = moveToY - moveFromY;

      if (isOddTurn && isOddPiece) {
        if(Math.abs(dx) == 2 && Math.abs(dy) == 2) {
          const potentialEnemyPieceCoordinates = {x: moveFromX +dx/2, y: moveFromY +dy/2};
          const potentialEnemyPiece = pieces[potentialEnemyPieceCoordinates.x][potentialEnemyPieceCoordinates.y]
          console.log({potentialEnemyPiece})

          if(potentialEnemyPiece == null || potentialEnemyPiece.odd){
            return {canMove: false};
          } else {
            return {canMove: true, toRemove: potentialEnemyPiece};
          }
        }

        const canMove = (dx == 1 || dx == 2) && (Math.abs(dx) == Math.abs(dy));
        return {canMove};
      } else if (!isOddTurn && !isOddPiece) {
        if(Math.abs(dx) == 2 && Math.abs(dy) == 2) {
          const potentialEnemyPieceCoordinates = {x: moveFromX +dx/2, y: moveFromY +dy/2};
          const potentialEnemyPiece = pieces[potentialEnemyPieceCoordinates.x][potentialEnemyPieceCoordinates.y]
          console.log({potentialEnemyPiece})

          if(potentialEnemyPiece == null || !potentialEnemyPiece.odd){
            return {canMove: false};
          } else {
            return {canMove: true, toRemove: potentialEnemyPiece};
          }
        }

        const canMove = (dx == -1 || dx == -2) && (Math.abs(dx) == Math.abs(dy));
        return {canMove};
      } 

      return {canMove: false};
  },[setPieces, pieces, board, setOddScore])


  const handleDragEnd = React.useCallback(function handleDragEnd(event: DragEndEvent) {
    if(!movingPiece?.position || !event.over?.id) {
      return;
    }
    
    const {x: movingPieceX, y: movingPieceY} = movingPiece.position;
    const [droppCaseX, droppCaseY] = event.over.id.split("-").map(Number)

    const potentialExistingPiece = pieces[droppCaseX][droppCaseY]

    // debugger;
    if(event.over && !potentialExistingPiece) {
      setMovingPiece(null)

      const {canMove, toRemove} = checkCanMove(isOddTurn, movingPiece.odd, movingPiece, droppCaseX, droppCaseY);
      
      if(!canMove) {
        return;
      }
      const newPiece: PieceProps = {...movingPiece, position: {x: droppCaseX, y: droppCaseY}}
      // Clone pieces
      const newPieces = pieces.map(row => row.slice());
      // Place new 
      delete newPieces[movingPieceX][movingPieceY];
      newPieces[droppCaseX][droppCaseY] = newPiece;
      // Remove enemy
      if(toRemove?.position) {
        delete newPieces[toRemove.position?.x][toRemove.position?.y];
        if(toRemove.odd){
          setEvenScore(score => score + 1);
        } else {
          setOddScore(score => score + 1);
        }
      }

      setPieces(newPieces)
      setIsOddTurn( turn => !turn )
    }
  },
    [board, setIsOddTurn, movingPiece, pieces, setPieces, checkCanMove],
  )

  const handleDragStart = React.useCallback(function handleDragStart(event: DragStartEvent) {
    const movingPieceId = event.active.id


    if(movingPiece == null && event.active.id) {
      for (let x = 0; x < BOARD_SIZE ; x++)  {
        for (let y = 0; y < BOARD_SIZE ; y++)  {
          const piece = pieces[x][y];
          if(piece != null
              && piece.id == movingPieceId
            ){
              setMovingPiece(piece);
              return;
          }
        }
      }

    }
  }, [board, movingPiece, pieces, setMovingPiece])


  const gameEndMarkup = evenWon || oddWon ?
  <div>
    <h2>{oddWon ? "Red" : "Blue"} Won !</h2>
    <button onClick={handleRestart}>Start Over</button>
  </div>
  : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <h1>{isOddTurn ? "Blue" : "Red"}'s Turn</h1>
      <p>Blue's score: {oddScore}</p>
      <p>Red's score: {evenScore}</p>
      {gameEndMarkup}
      <div style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', maxWidth: CASE_SIZE * BOARD_SIZE}}>
        {board.map( 
          (row, x) => 
            row.map( (rowCase, y) => {
              const piece = pieces[x][y];
              const disabled = piece?.odd && !isOddTurn || !piece?.odd && isOddTurn;

              if(!piece) return <BoardCase key={rowCase.id} {...rowCase}/>

              const pieceMarkup = disabled 
                  ? <Piece {...piece} disabled /> 
                  : <DraggablePiece id={piece.id}>
                      <Piece {...piece} />
                    </DraggablePiece>
              
              return (
                <BoardCase key={rowCase.id} {...rowCase}>
                  {pieceMarkup}
                </BoardCase> 
              )
            })
          )}
      </div>
      <DraggableClone>
        {movingPiece == null ? null : <Piece  odd={movingPiece.odd} clone id={"clone"}/>}
      </DraggableClone>
    </DndContext>
  )

  function handleRestart(){
    setPieces(generatePieces(board));
    setOddScore(0)
    setEvenScore(0)
  }

}

interface BoardCaseProps {
  odd: boolean
  id: string;
  children?: (React.ReactElement | null);
}
const BoardCase = ({odd, id, children}: BoardCaseProps) => {
  const {setNodeRef, } = useDroppable({
    id,
  });

  const backgroundColor = odd ? 'black' : 'white';

  return <div ref={setNodeRef} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: CASE_SIZE, width: CASE_SIZE, backgroundColor}}>
    {children}
  </div>
}

interface PieceProps {
  id: string;
  odd: boolean;
  clone?: boolean;
  position?: {x: number, y: number};
  disabled?: boolean;
}

interface DraggableProps {
  id: string;
  children: React.ReactNode;
}

function DraggablePiece({children, id}: DraggableProps) {
  const {attributes, listeners, setNodeRef} = useDraggable({
    id,
  });

  return <div ref={setNodeRef} tabIndex={0} {...attributes} {...listeners}>{children}</div>
}

const Piece = ({odd, disabled, clone, id}: PieceProps) => {
  const backgroundColor = odd ? '#4c4cff' : '#ff4c4c';
  const opacity= disabled || clone ? .5 : 1;

  const style = {
    // transform: CSS.Translate.toString(transform),
    width: PIECE_SIZE, opacity, height: PIECE_SIZE, backgroundColor, borderRadius: PIECE_SIZE/2,
  };

  return <button aria-describedby={`piece id ${id}`} aria-roledescription="You have selected a piece" style={style}>
        {/* <p style={{color: 'purple', fontWeight: 'bold'}}>{position?.x}, {position?.y}</p> */}
      </button>
}

ReactDOM.render(<CheckersGame />, document.getElementById('root'));


// Make white boxes not droppable 