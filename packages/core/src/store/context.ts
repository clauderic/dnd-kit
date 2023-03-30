import {createContext} from 'react';

import {noop} from '../utilities/other';
import {defaultMeasuringConfiguration} from '../components/DndContext/defaults';
import {DroppableContainersMap} from './constructors';
import type {
  Active,
  InternalContextDescriptor,
  Over,
  PublicContextDescriptor,
} from './types';
import type {ClientRect} from '../types';

export const defaultPublicContext: PublicContextDescriptor = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: new Map(),
  droppableRects: new Map(),
  droppableContainers: new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null,
    },
    rect: null,
    setRef: noop,
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: defaultMeasuringConfiguration,
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false,
};

export const defaultInternalContext: InternalContextDescriptor = {
  activators: [],
  ariaDescribedById: {
    draggable: '',
  },
  dispatch: noop,
  draggableNodes: new Map(),
  measureDroppableContainers: noop,
  useMyActive: function (): Active | null {
    throw new Error('Function not implemented.');
  },
  useGloablActive: function (): Active | null {
    throw new Error('Function not implemented.');
  },
  useHasActive: function (): boolean {
    throw new Error('Function not implemented.');
  },
  useMyActivatorEvent: function (): Event | null {
    throw new Error('Function not implemented.');
  },
  useGlobalActivatorEvent: function (): Event | null {
    throw new Error('Function not implemented.');
  },
  useMyActiveNodeRect: function (): ClientRect | null {
    throw new Error('Function not implemented.');
  },
  useMyOverForDraggable: function (): Over | null {
    throw new Error('Function not implemented.');
  },
  useMyOverForDroppable: function (): Over | null {
    throw new Error('Function not implemented.');
  },
};

export const InternalContext = createContext<InternalContextDescriptor>(
  defaultInternalContext
);

export const PublicContext =
  createContext<PublicContextDescriptor>(defaultPublicContext);
