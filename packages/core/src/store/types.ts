import React from 'react';

import type {PositionalClientRect, UniqueIdentifier} from '../types';
import type {SyntheticListeners} from '../hooks/utilities';
import type {Action} from './actions';
import {CollisionDetection} from '../utilities';

export interface DraggableElement {
  node: React.MutableRefObject<HTMLElement | null>;
  id: UniqueIdentifier;
  index: number;
  collection: string;
  disabled: boolean;
}

export type Data = Record<string, any>;

export interface DroppableContainer {
  node: React.MutableRefObject<HTMLElement | null>;
  collisionDetection?: CollisionDetection;
  clientRect: React.MutableRefObject<PositionalClientRect | null>;
  data: React.MutableRefObject<Data>;
  id: UniqueIdentifier;
}

export type DroppableContainers = Record<UniqueIdentifier, DroppableContainer>;

export type PositionalClientRectMap = Map<
  UniqueIdentifier,
  PositionalClientRect
>;

export interface Active {
  node: React.MutableRefObject<HTMLElement>;
  id: UniqueIdentifier;
}

export interface State {
  active: Active | null;
  droppableContainers: DroppableContainers;
}

export interface DraggableContextType {
  dispatch: React.Dispatch<Action>;
  activators: SyntheticListeners;
  activatorEvent: Event | null;
  active: Active | null;
  activeRect: PositionalClientRect | null;
  ariaDescribedById: {
    draggable: UniqueIdentifier;
  };
  clientRects: PositionalClientRectMap;
  cloneNode: {
    nodeRef: React.MutableRefObject<HTMLElement | null>;
    clientRect: PositionalClientRect | null;
    setRef: (element: HTMLElement | null) => void;
  };
  droppableContainers: DroppableContainers;
  over: {
    id: UniqueIdentifier;
    clientRect: PositionalClientRect;
  } | null;
  scrollingContainerRect: PositionalClientRect | null;
  recomputeClientRects(): void;
  willRecomputeClientRects: boolean;
}
