import type {Transform} from '@dnd-kit/utilities';

export type Modifier = ({
  transform,
  activeRect,
  scrollingContainerRect,
}: {
  transform: Transform;
  activeRect: ClientRect | null;
  scrollingContainerRect: ClientRect | null;
}) => Transform;

export type Modifiers = Modifier[];
