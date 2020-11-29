import type {Without} from '@dnd-kit/utilities';

export type SyntheticEventName = keyof Without<
  React.DOMAttributes<any>,
  'children' | 'dangerouslySetInnerHTML'
>;
