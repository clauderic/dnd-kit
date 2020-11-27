import type {Without} from '@dropshift/utilities';

export type SyntheticEventName = keyof Without<
  React.DOMAttributes<any>,
  'children' | 'dangerouslySetInnerHTML'
>;
