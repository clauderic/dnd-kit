import {createContext, useContext, useEffect, useMemo, useRef} from 'react';
import {
  useDraggable,
  useDroppable,
  UseDraggableArguments,
  UseDroppableArguments,
} from '@dnd-kit/core';
import type {Data} from '@dnd-kit/core';
import {CSS, isKeyboardEvent, useCombinedRefs} from '@dnd-kit/utilities';

import {Context} from '../components';
import type {Disabled, SortableData, SortingStrategy} from '../types';
import {isValidIndex} from '../utilities';
import {
  defaultAnimateLayoutChanges,
  defaultAttributes,
  defaultTransition,
  disabledTransition,
  transitionProperty,
} from './defaults';
import type {AnimateLayoutChanges, SortableTransition} from './types';
import {useDerivedTransform} from './utilities';
import {ActiveContext} from '../components/SortableContext';
const NullContext = createContext<any>(null);

export interface Arguments
  extends Omit<UseDraggableArguments, 'disabled'>,
    Pick<UseDroppableArguments, 'resizeObserverConfig'> {
  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean | Disabled;
  strategy?: SortingStrategy;
  transition?: SortableTransition | null;
}

export function useSortable({
  animateLayoutChanges = defaultAnimateLayoutChanges,
  attributes: userDefinedAttributes,
  disabled: localDisabled,
  data: customData,
  id,
  strategy: localStrategy,
  resizeObserverConfig,
  transition = defaultTransition,
}: Arguments) {
  const {
    items,
    containerId,
    disabled: globalDisabled,
    disableTransforms,
    useDragOverlay,
    strategy: globalStrategy,
    useMyNewIndex,
    previousSortingStateRef,
  } = useContext(Context);
  const disabled: Disabled = normalizeLocalDisabled(
    localDisabled,
    globalDisabled
  );
  const index = items.indexOf(id);
  const data = useMemo<SortableData & Data>(
    () => ({sortable: {containerId, index, items}, ...customData}),
    [containerId, customData, index, items]
  );
  const itemsAfterCurrentSortable = useMemo(
    () => items.slice(items.indexOf(id)),
    [items, id]
  );
  const {
    rect,
    node,
    isOver,
    setNodeRef: setDroppableNodeRef,
  } = useDroppable({
    id,
    data,
    disabled: disabled.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: itemsAfterCurrentSortable,
      ...resizeObserverConfig,
    },
  });
  const {
    active,
    activatorEvent,
    activeNodeRect,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    over,
    setActivatorNodeRef,
    transform,
  } = useDraggable({
    id,
    data,
    attributes: {
      ...defaultAttributes,
      ...userDefinedAttributes,
    },
    disabled: disabled.draggable,
  });

  const activeSortable = useContext(isDragging ? ActiveContext : NullContext);
  let shouldDisplaceDragSource = false;
  let finalTransform = null;
  if (isDragging) {
    const activeIndex = activeSortable?.index;
    const sortedRects = activeSortable?.sortedRects;
    const overIndex = activeSortable?.overIndex;

    const displaceItem =
      !disableTransforms &&
      isValidIndex(activeIndex) &&
      isValidIndex(overIndex);

    const shouldDisplaceDragSource = !useDragOverlay;
    const dragSourceDisplacement =
      shouldDisplaceDragSource && displaceItem ? transform : null;

    const strategy = localStrategy ?? globalStrategy;
    finalTransform = displaceItem
      ? dragSourceDisplacement ??
        strategy({
          rects: sortedRects,
          activeNodeRect,
          activeIndex,
          overIndex,
          index,
        })
      : null;
  }

  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);

  const newIndex = useMyNewIndex(id, index);
  const prevNewIndex = useRef(newIndex);
  const itemsHaveChanged = items !== previousSortingStateRef.current.items;
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting: isDragging,
    id,
    index,
    items,
    newIndex: prevNewIndex.current,
    previousItems: previousSortingStateRef.current.items,
    previousContainerId: previousSortingStateRef.current.containerId,
    transition,
    wasDragging: previousSortingStateRef.current.activeId != null,
  });

  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect,
  });

  useEffect(() => {
    if (prevNewIndex.current !== newIndex) {
      prevNewIndex.current = newIndex;
    }
  }, [newIndex]);

  return {
    active,
    attributes,
    data,
    rect,
    index,
    newIndex,
    items,
    isOver,
    isDragging,
    listeners,
    node,
    over,
    setNodeRef,
    setActivatorNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform ?? finalTransform,
    transition: getTransition(),
  };

  function getTransition() {
    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      derivedTransform ||
      // Or to prevent items jumping to back to their "new" position when items change
      (itemsHaveChanged && prevNewIndex.current === index)
    ) {
      return disabledTransition;
    }

    if (
      (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent)) ||
      !transition
    ) {
      return undefined;
    }

    if (shouldAnimateLayoutChanges) {
      return CSS.Transition.toString({
        ...transition,
        property: transitionProperty,
      });
    }

    return undefined;
  }
}

function normalizeLocalDisabled(
  localDisabled: Arguments['disabled'],
  globalDisabled: Disabled
) {
  if (typeof localDisabled === 'boolean') {
    return {
      draggable: localDisabled,
      // Backwards compatibility
      droppable: false,
    };
  }

  return {
    draggable: localDisabled?.draggable ?? globalDisabled.draggable,
    droppable: localDisabled?.droppable ?? globalDisabled.droppable,
  };
}
