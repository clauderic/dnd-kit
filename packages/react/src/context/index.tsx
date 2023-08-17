import {lazy, Suspense, type PropsWithChildren} from 'react';

export {useDragDropManager} from './hook';
import type {Props} from './DragDropProvider';

const LazyLoadedProvider = lazy(() => import('./DragDropProvider'));

export function DragDropProvider(props: PropsWithChildren<Props>) {
  return (
    <Suspense fallback={props.children}>
      <LazyLoadedProvider {...props} />
    </Suspense>
  );
}
