import React, {useCallback, useMemo, useState} from 'react';
import {AnimateSharedLayout} from 'framer-motion';
import {
  DndContext,
  useDraggable,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  Board,
  Cell,
  CellProps,
  Endgame,
  Piece,
  PieceProps,
  Score,
} from './components';
import styles from './Checkers.module.css';

const BOARD_SIZE = 8;

interface CanMoveProps {
  canMove: boolean;
  toRemove?: PieceProps;
}

export function Checkers() {
  const [board] = useState(generateBoard);
  const [pieces, setPieces] = useState(() => generatePieces(board));
  const [movingPiece, setMovingPiece] = useState<PieceProps | null>(null);
  const [isOddTurn, setIsOddTurn] = useState(true);
  const [oddScore, setOddScore] = useState(0);
  const [evenScore, setEvenScore] = useState(0);
  const {evenWon, oddWon} = useMemo(() => checkEnd(pieces), [pieces]);

  const checkCanMove = useCallback(
    function (
      isOddTurn: boolean,
      isOddPiece: boolean,
      movingPiece: PieceProps,
      moveToX: number,
      moveToY: number
    ): CanMoveProps {
      if (movingPiece.position) {
        const {x: moveFromX, y: moveFromY} = movingPiece.position;

        const dx = moveToX - moveFromX;
        const dy = moveToY - moveFromY;

        if (isOddTurn && isOddPiece) {
          if (dy < 0) {
            return {canMove: false};
          }

          if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
            const potentialEnemyPieceCoordinates = {
              x: moveFromX + dx / 2,
              y: moveFromY + dy / 2,
            };
            const potentialEnemyPiece =
              pieces[potentialEnemyPieceCoordinates.y][
                potentialEnemyPieceCoordinates.x
              ];

            if (potentialEnemyPiece == null || potentialEnemyPiece.odd) {
              return {canMove: false};
            } else {
              return {canMove: true, toRemove: potentialEnemyPiece};
            }
          }

          const canMove =
            (dy === 1 || dy === 2) && Math.abs(dx) === Math.abs(dy);
          return {canMove};
        } else if (!isOddTurn && !isOddPiece) {
          if (dy > 0) {
            return {canMove: false};
          }

          if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
            const potentialEnemyPieceCoordinates = {
              x: moveFromX + dx / 2,
              y: moveFromY + dy / 2,
            };
            const potentialEnemyPiece =
              pieces[potentialEnemyPieceCoordinates.y][
                potentialEnemyPieceCoordinates.x
              ];

            if (potentialEnemyPiece == null || !potentialEnemyPiece.odd) {
              return {canMove: false};
            } else {
              return {canMove: true, toRemove: potentialEnemyPiece};
            }
          }

          const canMove =
            (dy === -1 || dy === -2) && Math.abs(dx) === Math.abs(dy);
          return {canMove};
        }
      }

      return {canMove: false};
    },
    [pieces]
  );

  const handleDragCancel = useCallback(() => {
    setMovingPiece(null);
  }, []);

  const handleDragEnd = useCallback(
    function handleDragEnd(event: DragEndEvent) {
      if (!movingPiece?.position || !event.over?.id) {
        return;
      }

      const {x: movingPieceX, y: movingPieceY} = movingPiece.position;
      const [cellY, cellX] = event.over.id.toString().split('-').map(Number);

      const potentialExistingPiece = pieces[cellY][cellX];

      setMovingPiece(null);

      if (event.over && !potentialExistingPiece) {
        const {canMove, toRemove} = checkCanMove(
          isOddTurn,
          movingPiece.odd,
          movingPiece,
          cellX,
          cellY
        );

        if (!canMove) {
          return;
        }
        const newPiece: PieceProps = {
          ...movingPiece,
          position: {x: cellX, y: cellY},
        };
        // Clone pieces
        const newPieces = pieces.map((row) => row.slice());
        // Place new
        delete newPieces[movingPieceY][movingPieceX];
        newPieces[cellY][cellX] = newPiece;
        // Remove enemy
        if (toRemove?.position) {
          delete newPieces[toRemove.position?.y][toRemove.position?.x];
          if (toRemove.odd) {
            setEvenScore((score) => score + 1);
          } else {
            setOddScore((score) => score + 1);
          }
        }

        setPieces(newPieces);
        setIsOddTurn((turn) => !turn);
      }
    },
    [movingPiece, pieces, checkCanMove, isOddTurn]
  );

  const handleDragStart = useCallback(
    function handleDragStart({active}: DragStartEvent) {
      const piece = pieces.reduce<PieceProps | undefined>((acc, row) => {
        return acc ?? row.find((cell) => cell?.id === active.id);
      }, undefined);

      if (piece) {
        setMovingPiece(piece);
      }
    },
    [pieces]
  );

  const players = ['Blue', 'Black'];
  const gameEnded = evenWon || oddWon;

  return (
    <AnimateSharedLayout type="crossfade">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className={styles.Checkers}>
          {gameEnded ? (
            <Endgame
              winnerLabel={oddWon ? players[1] : players[0]}
              winnerScore={oddWon ? oddScore : evenScore}
              onPlayAgain={handleRestart}
            />
          ) : (
            <Score
              oddLabel={players[0]}
              evenLabel={players[1]}
              oddScore={oddScore}
              evenScore={evenScore}
              oddTurn={isOddTurn}
            />
          )}
          <Board size={BOARD_SIZE}>
            {board.map((row, y) =>
              row.map((rowCase, x) => {
                const piece = pieces[y][x];
                const disabled =
                  (piece?.odd && !isOddTurn) || (!piece?.odd && isOddTurn);

                if (!piece) {
                  const canDrop = movingPiece
                    ? checkCanMove(
                        isOddTurn,
                        movingPiece.odd,
                        movingPiece,
                        x,
                        y
                      ).canMove
                    : false;

                  return (
                    <Cell
                      key={rowCase.id}
                      validDropLocation={canDrop}
                      {...rowCase}
                    />
                  );
                }

                const pieceMarkup = disabled ? (
                  <Piece {...piece} disabled />
                ) : (
                  <DraggablePiece {...piece} />
                );

                return (
                  <Cell key={rowCase.id} {...rowCase}>
                    {pieceMarkup}
                  </Cell>
                );
              })
            )}
          </Board>
        </div>
        <DragOverlay dropAnimation={null}>
          {movingPiece == null ? null : (
            <Piece odd={movingPiece.odd} clone id={movingPiece.id} />
          )}
        </DragOverlay>
      </DndContext>
    </AnimateSharedLayout>
  );

  function handleRestart() {
    setPieces(generatePieces(board));
    setOddScore(0);
    setEvenScore(0);
  }
}

function DraggablePiece(props: PieceProps) {
  const {attributes, isDragging, listeners, setNodeRef} = useDraggable({
    id: props.id,
  });

  return (
    <Piece
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.5 : undefined,
      }}
      {...props}
      {...attributes}
      {...listeners}
    />
  );
}

function generateBoard() {
  const board: CellProps[][] = Array.from(
    Array(BOARD_SIZE),
    () => new Array(BOARD_SIZE)
  );

  let odd = false;

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (x % BOARD_SIZE !== 0) {
        odd = !odd;
      }

      board[y][x] = {odd, id: `${y}-${x}`, x, y};
    }
  }

  return board;
}

function generatePieces(board: CellProps[][]) {
  const pieces: (PieceProps | undefined)[][] = Array.from(
    Array(BOARD_SIZE),
    () => new Array(BOARD_SIZE)
  );

  const piecesRows = [0, 1, 2, BOARD_SIZE - 3, BOARD_SIZE - 2, BOARD_SIZE - 1];

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const boardCase = board[y][x];
      if (boardCase.odd && piecesRows.includes(y)) {
        const odd = y <= BOARD_SIZE / 2;
        pieces[y][x] = {
          odd,
          id: `${y}-${x}`,
          position: {x, y},
          disabled: false,
        };
      }
    }
  }

  return pieces;
}

function checkEnd(
  pieces: (PieceProps | undefined)[][]
): {oddWon: boolean; evenWon: boolean} {
  const result = {oddWon: true, evenWon: true};

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const piece = pieces[y][x];
      if (!piece) continue;

      if (piece.odd) {
        result.oddWon = false;
      } else {
        result.evenWon = false;
      }
    }
  }

  return result;
}
