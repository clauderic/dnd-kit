import {useContext, useEffect, useMemo, useRef} from 'react';
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
import {
  defaultAnimateLayoutChanges,
  defaultAttributes,
  defaultTransition,
  disabledTransition,
  transitionProperty,
} from './defaults';
import type {AnimateLayoutChanges, SortableTransition} from './types';
import {useDerivedTransform} from './utilities';

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
  //TODO: deal with local strategy....
  // strategy: localStrategy,
  resizeObserverConfig,
  transition = defaultTransition,
}: Arguments) {
  const {
    items,
    containerId,
    disabled: globalDisabled,
    disableTransforms,
    useDragOverlay,
    useMyNewIndex,
    previousSortingStateRef,
    useMyStrategyValue,
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

  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);

  const shouldDisplaceDragSource =
    !disableTransforms && !useDragOverlay && isDragging;
  const dragSourceDisplacement = shouldDisplaceDragSource ? transform : null;
  const otherItemDisplacement = useMyStrategyValue(id, index, activeNodeRect);
  const finalTransform =
    dragSourceDisplacement ??
    (otherItemDisplacement ? JSON.parse(otherItemDisplacement) : null);

  const newIndex = useMyNewIndex(id, index);
  const prevNewIndex = useRef(newIndex);
  const itemsHaveChanged = items !== previousSortingStateRef.current.items;
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    //this value was true as long as there is an active item... not sure what was the purpose
    isSorting: true,
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
    index: newIndex,
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

    return CSS.Transition.toString({
      ...transition,
      property: transitionProperty,
    });
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
