import type {Transform} from '@dnd-kit/utilities';
import type {ClientRect, ViewRect} from '../types';

export type Modifier = (args: {
  transform: Transform;
  activeNodeRect: ViewRect | null;
  draggingNodeRect: ViewRect | null;
  containerNodeRect: ViewRect | null;
  overlayNodeRect: ViewRect | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ViewRect[];
  windowRect: ClientRect | null;
}) => Transform;

export type Modifiers = Modifier[];
