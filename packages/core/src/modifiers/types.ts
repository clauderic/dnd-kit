import type {Transform} from '@schuchertmanagementberatung/dnd-kit-utilities';
import type {Active, Over} from '../store';
import type {ClientRect} from '../types';

export type Modifier = (args: {
  activatorEvent: Event | null;
  active: Active | null;
  activeNodeRect: ClientRect | null;
  draggingNodeRect: ClientRect | null;
  containerNodeRect: ClientRect | null;
  over: Over | null;
  overlayNodeRect: ClientRect | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ClientRect[];
  transform: Transform;
  windowRect: ClientRect | null;
}) => Transform;

export type Modifiers = Modifier[];
