import { createSignal, JSX, For, splitProps, createMemo, Show, createEffect, mergeProps } from 'solid-js';
import type { JSX as SolidJSX } from 'solid-js';

import type {
  CollisionDetector,
  DragDropManager,
  Modifiers,
  UniqueIdentifier,
} from '@dnd-kit/abstract';

import {FeedbackType, defaultPreset, type Draggable} from '@dnd-kit/dom';
import {type SortableTransition } from '@dnd-kit/dom/sortable';
import {DragDropProvider, useSortable, type DragDropEvents} from '@dnd-kit/solid';
import {directionBiased} from '@dnd-kit/collision';
import {move} from '@dnd-kit/helpers';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import { Item } from '../../components/Item';
import { Handle } from '../../components/Actions/Handle.tsx';

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
  transition?: SortableTransition;
  style?: CSSProperties;
}


export function createRange(count: number): { id: UniqueIdentifier, index: number }[] {
  return Array.from(Array(count).keys()).map(index => ({ id: index, index }));
}


export function SortableExample(_props: SortableExampleProps) {
  const props = mergeProps({
    debug: false,
    itemCount: 5,
    collisionDetector: directionBiased,
    dragHandle: false,
    feedback: 'default',
    layout: 'vertical',
  } as const, _props);
  
  const [local, rest] = splitProps(props, [
    'debug',
    'itemCount',
    'collisionDetector',
    'disabled',
    'dragHandle',
    'feedback',
    'layout',
    'modifiers',
    'transition',
    'getItemStyle',
  ]);

  const [items, setItems] = createSignal(createRange(local.itemCount));

  createEffect(() => {
    if (local.itemCount != null) {
      setItems(createRange(local.itemCount));
    }
  });

  const handleDragEnd: DragDropEvents['dragend'] = (event) => {
    setItems(items => [...move(items, event)]);
  }
  
  createEffect(() => {
    console.log('items changed', items());
  });
  
  const plugins = createMemo(() => {
    let plugins = [...defaultPreset.plugins];
    
    if (local.debug) {
      plugins.push(Debug);
    }
    
    return plugins;
  });
  
  return (
    <DragDropProvider
      plugins={plugins()}
      modifiers={local.modifiers}
      onDragEnd={handleDragEnd}
      {...rest}
    >
      <Wrapper layout={local.layout}>
        <For each={items()}>
          {(value, index) => (
              <SortableItem
                id={value.id}
                index={index()}
                collisionDetector={local.collisionDetector}
                disabled={local.disabled?.includes(value.id)}
                dragHandle={local.dragHandle}
                feedback={local.feedback}
                transition={local.transition}
                style={local.getItemStyle?.(value.id, index())}
              />
          )}
        </For>
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
  const { layout, children } = props;
  
  const baseStyles: CSSProperties = {
    gap: '18px',
    padding: '0 30px',
  };
  
  let style: CSSProperties;
  
  switch (layout) {
    case 'grid':
      style = {
        ...baseStyles,
        display: 'grid',
        'max-width': '900px',
        'margin-inline': 'auto',
        'grid-template-columns': 'repeat(auto-fill, 150px)',
        'grid-auto-flow': 'dense',
        'grid-auto-rows': '150px',
        'justify-content': 'center',
      };
      break;
    case 'horizontal':
      style = {
        ...baseStyles,
        display: 'inline-flex',
        'flex-direction': 'row',
        'align-items': 'stretch',
        height: '180px',
      };
      break;
    case 'vertical':
    default:
      style = {
        ...baseStyles,
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
      };
      break;
  }
  
  return <div style={style}>{children}</div>;
}
