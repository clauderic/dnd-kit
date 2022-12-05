import type {Without} from '@schuchertmanagementberatung/dnd-kit-utilities';

export type SyntheticEventName = keyof Without<
  React.DOMAttributes<any>,
  'children' | 'dangerouslySetInnerHTML'
>;
