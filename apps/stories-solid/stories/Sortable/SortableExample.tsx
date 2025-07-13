import { createSignal, JSX, For, splitProps, createMemo, Show, createEffect } from 'solid-js';
import type { JSX as SolidJSX } from 'solid-js';

import type {
  CollisionDetector,
  Modifiers,
  UniqueIdentifier,
} from '@dnd-kit/abstract';

import {FeedbackType, defaultPreset} from '@dnd-kit/dom';
import {type SortableTransition} from '@dnd-kit/dom/sortable';
import {DragDropProvider, useSortable} from '@dnd-kit/solid';
import {directionBiased} from '@dnd-kit/collision';
import {move} from '@dnd-kit/helpers';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import { Item } from '../../components/Item';
import { Handle } from '../../components/Actions/Handle.tsx';
import {createRange} from '../../utilities/createRange.ts';

// CSSProperties is a local type for style objects
type CSSProperties = JSX.CSSProperties;

interface SortableExampleProps {
  debug?: boolean;
  dragHandle?: boolean;
  disabled?: UniqueIdentifier[];
  feedback?: FeedbackType;
  modifiers?: Modifiers;
  layout?: 'vertical' | 'horizontal' | 'grid';
  transition?: SortableTransition;
  itemCount?: number;
  optimistic?: boolean;
  collisionDetector?: CollisionDetector;
  getItemStyle?: (id: UniqueIdentifier, index: number) => CSSProperties;
}


interface SortableProps {
  id: UniqueIdentifier;
  index: number;
  collisionDetector?: CollisionDetector;
  disabled?: boolean;
  dragHandle?: boolean;
  feedback?: FeedbackType;
  optimistic?: boolean;
  transition?: SortableTransition;
  style?: CSSProperties;
}

export function SortableExample(props: SortableExampleProps) {
  const [local, rest] = splitProps(props, [
    'debug',
    'itemCount',
    'collisionDetector',
    'disabled',
    'dragHandle',
    'feedback',
    'layout',
    'optimistic',
    'modifiers',
    'transition',
    'getItemStyle',
  ]);

  const [items, setItems] = createSignal(createRange(local.itemCount ?? 5));

  // createEffect(() => {
  //   console.log('items', items());
  // });
  
  function handleDragOver(event: any) {
    console.log('handleDragOver', items(), move(items(), event));
    
    if (local.optimistic ?? true) return;
     
    setItems(move(items(), event));
  }

  function handleDragEnd(event: any) {
    console.log('handleDragEnd', items(), move(items(), event));
    
    setItems(move(items(), event));
  }
  
  createEffect(() => {
    if (local.itemCount != null) {
      setItems(createRange(local.itemCount));
    }
  });
  
  return (
    <DragDropProvider
      plugins={local.debug ? [...defaultPreset.plugins, Debug] : undefined}
      modifiers={local.modifiers}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      {...rest}
    >
      <Wrapper layout={local.layout ?? 'vertical'}>
        <For each={items()}>{(id, index) => (
          <SortableItem
            id={id}
            index={index()}
            collisionDetector={local.collisionDetector ?? directionBiased}
            disabled={local.disabled?.includes(id)}
            dragHandle={local.dragHandle}
            feedback={local.feedback}
            optimistic={local.optimistic}
            transition={local.transition}
            style={local.getItemStyle?.(id, index())}
          />
        )}</For>
      </Wrapper>
    </DragDropProvider>
  );
}


function SortableItem(props: SortableProps) {
  const [sortableProps, rest] = splitProps(props, [
    'id',
    'index',
    'collisionDetector',
    'disabled',
    'feedback',
    'transition',
    'dragHandle',
  ]);

  const { isDragging, ref, handleRef } = useSortable(sortableProps);

  return (
    <Item
      ref={ref}
      shadow={isDragging()}
      {...rest}
    >
      <span>{sortableProps.id}</span>
      
      <Show when={sortableProps.dragHandle}>
        <Handle ref={handleRef} />
      </Show>
    </Item>
  );
}

function Wrapper(props: { layout: 'vertical' | 'horizontal' | 'grid'; children: SolidJSX.Element }) {
  return <div style={getWrapperStyles(props.layout)}>
    {props.children}
  </div>;
}

function getWrapperStyles(layout: 'vertical' | 'horizontal' | 'grid'): CSSProperties {
  const baseStyles: CSSProperties = {
    gap: '18px',
    padding: '0 30px',
  };
  switch (layout) {
    case 'grid':
      return {
        ...baseStyles,
        display: 'grid',
        'max-width': '900px',
        'margin-inline': 'auto',
        'grid-template-columns': 'repeat(auto-fill, 150px)',
        'grid-auto-flow': 'dense',
        'grid-auto-rows': '150px',
        'justify-content': 'center',
      };
    case 'horizontal':
      return {
        ...baseStyles,
        display: 'inline-flex',
        'flex-direction': 'row',
        'align-items': 'stretch',
        height: '180px',
      };
    case 'vertical':
      return {
        ...baseStyles,
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
      };
  }
}
