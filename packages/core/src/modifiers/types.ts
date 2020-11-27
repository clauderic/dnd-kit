import type {Transform} from '@dropshift/utilities';

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
