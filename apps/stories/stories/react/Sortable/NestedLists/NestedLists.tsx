import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider, useDroppable} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import {Actions, Container, Item, Handle} from '../../components/index.ts';
import {cloneDeep} from '../../../utilities/cloneDeep.ts';
import {deepMove} from './deepMove.ts';

interface Props {
  debug?: boolean;
}

interface Card {
  id: string;
  type: 'card';
}

export interface Group {
  id: string;
  type: 'group';
  items: Node[];
}

export type Root = {
  id: 'root';
  type: 'root';
  items: Node[];
};

export type Node = Root | Card | Group;

interface SortableCardProps {
  id: string;
  group: string;
  index: number;
  style?: React.CSSProperties;
}

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  A1: '#2ECC40',
};

const DeepRender = ({content, group}: {content: Node[]; group: string}) => {
  return content.map((item, index) => {
    if (item.type === 'card') {
      return (
        <SortableCard key={item.id} id={item.id} group={group} index={index} />
      );
    }

    return (
      <SortableGroup
        accentColor={COLORS[group]}
        key={item.id}
        id={item.id}
        index={index}
        group={group}
      >
        <DeepRender content={item.items} group={item.id} />
      </SortableGroup>
    );
  });
};

export function NestedLists({debug}: Props) {
  const [data, setData] = useState<Root>({
    id: 'root',
    type: 'root',
    items: [
      {
        type: 'group',
        id: 'A',
        items: [
          {
            type: 'group',
            id: 'A1',
            items: [
              {type: 'card', id: 'A1.1'},
              {type: 'card', id: 'A1.2'},
              {type: 'card', id: 'A1.3'},
            ],
          },
          {type: 'card', id: 'A2'},
          {type: 'card', id: 'A3'},
        ],
      },
      {
        type: 'group',
        id: 'B',
        items: [
          {type: 'card', id: 'B1'},
          {type: 'card', id: 'B2'},
          {type: 'card', id: 'B3'},
        ],
      },
    ],
  });

  const snapshot = useRef(cloneDeep(data));

  return (
    <DragDropProvider
      plugins={debug ? [...defaultPreset.plugins, Debug] : undefined}
      onDragStart={() => {
        snapshot.current = cloneDeep(data);
      }}
      onDragOver={(event) => {
        event.preventDefault();

        setData((data) => {
          return deepMove(data, event.operation) as Root;
        });
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setData(snapshot.current);
        }
      }}
    >
      <Root>
        <DeepRender content={data.items} group={'root'} />
      </Root>
    </DragDropProvider>
  );
}

function SortableCard({
  id,
  group,
  index,
  style,
}: PropsWithChildren<SortableCardProps>) {
  const {ref, isDragSource} = useSortable({
    id,
    group,
    accept: ['card', 'group'],
    type: 'card',
    feedback: 'clone',
    index,
    data: {group},
  });

  return (
    <Item
      ref={ref}
      accentColor={COLORS[group]}
      shadow={isDragSource}
      style={style}
    >
      {id}
    </Item>
  );
}

interface SortableGroupProps {
  accentColor?: string;
  id: string;
  index: number;
  group: string;
  scrollable?: boolean;
  style?: React.CSSProperties;
}

function SortableGroup({
  accentColor,
  children,
  id,
  index,
  group,
  style,
}: PropsWithChildren<SortableGroupProps>) {
  const {handleRef, ref} = useSortable({
    id,
    accept: ['group', 'card'],
    collisionPriority: CollisionPriority.Low,
    type: 'group',
    group,
    feedback: 'clone',
    index,
    data: {group},
  });

  return (
    <Container
      accentColor={accentColor}
      ref={ref}
      label={`${id}`}
      actions={
        <Actions>
          <Handle ref={handleRef} />
        </Actions>
      }
      style={style}
    >
      {children}
    </Container>
  );
}

function Root({children}: PropsWithChildren<{}>) {
  const {ref} = useDroppable({
    id: 'root',
    collisionPriority: CollisionPriority.Low,
    type: 'root',
    disabled: true,
  });

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
      }}
      ref={ref}
    >
      {children}
    </div>
  );
}
