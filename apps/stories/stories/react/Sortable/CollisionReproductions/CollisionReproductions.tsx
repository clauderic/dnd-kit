import React, {useEffect, useRef, useState} from 'react';
import {DragDropProvider, useDraggable, useDroppable} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {Feedback, type DragDropManager} from '@dnd-kit/dom';
import {CollisionPriority} from '@dnd-kit/abstract';
import {move} from '@dnd-kit/helpers';
import {untracked} from '@dnd-kit/state';

// Investigation only: observe the real detector and renderer without changing
// collision policy. Keep the trace outside React state to avoid extra renders.
export interface CollisionSample {
  event: string;
  point: {x: number; y: number};
  target: string | number | null;
  source: string | number | null;
  collisions: {
    id: string | number;
    value: number;
    type: number;
    priority: number;
  }[];
  shapes: {id: string | number; rect: unknown}[];
  sourceShape: unknown;
}

declare global {
  interface Window {
    __collisionRepro?: {
      manager: DragDropManager;
      samples: CollisionSample[];
      snapshot: () => CollisionSample;
    };
  }
}

function sample(manager: DragDropManager, event: string): CollisionSample {
  return untracked(() => {
    const {dragOperation, collisionObserver, registry} = manager;
    return {
      event,
      point: {...dragOperation.position.current},
      source: dragOperation.sourceIdentifier,
      target: dragOperation.targetIdentifier,
      collisions: collisionObserver.collisions.map(
        ({id, value, type, priority}) => ({
          id,
          value,
          type,
          priority,
        })
      ),
      shapes: Array.from(registry.droppables).map(({id, shape}) => ({
        id,
        rect: shape?.boundingRectangle,
      })),
      sourceShape: dragOperation.shape?.current.boundingRectangle,
    };
  });
}

const cardStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  width: 188,
  height: 64,
  flexShrink: 0,
  border: '1px solid #8090ab',
  borderRadius: 6,
  background: '#fff',
  color: '#243149',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  touchAction: 'none',
  cursor: 'grab',
  fontSize: 18,
};
const columnStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  width: 220,
  flexShrink: 0,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  borderRadius: 8,
  background: '#e8edf5',
  color: '#243149',
};

function Column({id, children}: React.PropsWithChildren<{id: string}>) {
  const {ref} = useDroppable({
    id,
    accept: 'card',
    collisionPriority: CollisionPriority.Low,
  });
  return (
    <div ref={ref} data-column={id} style={columnStyle}>
      <strong style={{height: 20}}>{id}</strong>
      {children}
    </div>
  );
}

function Card({id}: {id: string}) {
  const {ref} = useDraggable({
    id,
    type: 'card',
    plugins: [Feedback.configure({feedback: 'clone'})],
  });
  return (
    <div ref={ref} data-card={id} style={cardStyle}>
      {id}
    </div>
  );
}

function Row({id, index, group}: {id: string; index: number; group?: string}) {
  const {ref} = useSortable({id, index, group, type: 'card', accept: 'card'});
  return (
    <div ref={ref} data-card={id} style={cardStyle}>
      {id}
    </div>
  );
}

function ScrollTarget({id}: {id: string}) {
  const {ref} = useDroppable({id, accept: 'card'});
  return (
    <div
      ref={ref}
      data-scroll-target={id}
      style={{
        height: 160,
        boxSizing: 'border-box',
        border: '1px solid #8090ab',
        background: '#e8edf5',
        padding: 20,
      }}
    >
      {id}
    </div>
  );
}

export function CollisionReproductions({
  vertical = false,
  itemTargets = false,
  scrolling = false,
}: {
  vertical?: boolean;
  itemTargets?: boolean;
  scrolling?: boolean;
}) {
  const [columns, setColumns] = useState<Record<string, string[]>>({
    A: ['1', '2', '3'],
    B: ['4'],
  });
  const [rows, setRows] = useState(['1', '2', '3', '4']);
  const trace = useRef<CollisionSample[]>([]);
  const output = useRef<HTMLPreElement>(null);

  useEffect(
    () => () => {
      delete window.__collisionRepro;
    },
    []
  );

  function record(manager: DragDropManager, event: string) {
    if (event === 'start') trace.current.length = 0;
    const entry = sample(manager, event);
    trace.current.push(entry);
    if (trace.current.length > 2000) trace.current.shift();
    window.__collisionRepro = {
      manager,
      samples: trace.current,
      snapshot: () => sample(manager, 'snapshot'),
    };
    if (output.current) {
      output.current.textContent = JSON.stringify(
        {
          point: entry.point,
          winner: entry.collisions[0]?.id ?? null,
          target: entry.target,
          changes: trace.current.filter(({event}) => event === 'over').length,
          recentTargets: trace.current
            .filter(({event}) => event === 'over')
            .slice(-12)
            .map(({target}) => target),
        },
        null,
        2
      );
    }
  }

  return (
    <section
      style={{
        display: 'block',
        width: 760,
        padding: 40,
        color: '#243149',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{width: 'auto'}}>
        {scrolling
          ? 'Stationary pointer scrolling'
          : vertical
            ? 'Vertical reversal control'
            : 'Auto-height column oscillation'}
      </h2>
      <p style={{width: 'auto', maxWidth: 680}}>
        {scrolling
          ? 'Drag the card over the scrollable targets, then scroll without moving the pointer. The selected target should follow the scroll immediately.'
          : vertical
            ? 'Drag row 1 below row 2, then reverse direction. Repeat near the swap boundary. Each pointer move should be eligible immediately, including reversals smaller than 10px.'
            : 'Drag card 3 into the gap near the top of the two columns and move it by 1px up and down. The pointer stays outside both columns while the card overlaps both. Transferring the card changes column heights and can reverse their collision ranking.'}
      </p>
      <DragDropProvider
        onDragStart={(_, manager) => record(manager, 'start')}
        onCollision={(_, manager) => record(manager, 'collision')}
        onDragOver={(event, manager) => {
          record(manager, 'over');
          if (vertical || scrolling) return;
          const {source, target} = event.operation;
          if (!source || !target) return;
          setColumns((current) => {
            if (itemTargets) return move(current, event);
            const from = Object.keys(current).find((key) =>
              current[key].includes(String(source.id))
            );
            const to = String(target.id);
            if (!from || from === to || !current[to]) return current;
            return {
              ...current,
              [from]: current[from].filter((id) => id !== source.id),
              [to]: [...current[to], String(source.id)],
            };
          });
        }}
        onDragEnd={(event, manager) => {
          record(manager, 'end');
          if (vertical) setRows((current) => move(current, event));
        }}
      >
        <div
          data-repro-board
          style={{
            display: 'flex',
            width: '100%',
            gap: 32,
            alignItems: 'flex-start',
          }}
        >
          {scrolling ? (
            <>
              <Card id="drag" />
              <div
                data-scroll-region
                style={{height: 160, width: 220, overflow: 'auto'}}
              >
                {['A', 'B', 'C'].map((id) => (
                  <ScrollTarget key={id} id={id} />
                ))}
              </div>
            </>
          ) : vertical ? (
            <div data-column="list" style={{...columnStyle, gap: 0}}>
              {rows.map((id, index) => (
                <Row key={id} id={id} index={index} />
              ))}
            </div>
          ) : (
            Object.entries(columns).map(([group, cards]) => (
              <Column key={group} id={group}>
                {cards.map((id, index) =>
                  itemTargets ? (
                    <Row key={id} id={id} index={index} group={group} />
                  ) : (
                    <Card key={id} id={id} />
                  )
                )}
              </Column>
            ))
          )}
        </div>
      </DragDropProvider>
      <pre
        ref={output}
        data-collision-summary
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          width: 310,
          height: 260,
          overflow: 'auto',
          background: '#f4f6fa',
          padding: 12,
          pointerEvents: 'none',
          fontSize: 12,
        }}
      >
        Drag to record a collision trace.
      </pre>
    </section>
  );
}
