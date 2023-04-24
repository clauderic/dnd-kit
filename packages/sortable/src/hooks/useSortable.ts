import {
  useDraggable,
  useDroppable,
  UseDraggableArguments,
  UseDroppableArguments,
  Data,
} from '@schuchertmanagementberatung/dnd-kit-core';
import {
  CSS,
  isKeyboardEvent,
  useCombinedRefs,
} from '@schuchertmanagementberatung/dnd-kit-utilities';
import {useContext, useMemo, useRef, useEffect} from 'react';
import {Context} from '../components';
import type {Disabled, SortingStrategy, SortableData} from '../types';

import {
  defaultAnimateLayoutChanges,
  defaultAttributes,
  defaultTransition,
  disabledTransition,
  transitionProperty,
} from './defaults';
import type {
  AnimateLayoutChanges,
  NewIndexGetter,
  SortableTransition,
} from './types';
import {useDerivedTransform} from './utilities';

export interface Arguments
  extends Omit<UseDraggableArguments, 'disabled'>,
    Pick<UseDroppableArguments, 'resizeObserverConfig'> {
  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean | Disabled;
  getNewIndex?: NewIndexGetter;
  strategy?: SortingStrategy;
  transition?: SortableTransition | null;
}

export function useSortable({
  animateLayoutChanges = defaultAnimateLayoutChanges,
  attributes: userDefinedAttributes,
  disabled: localDisabled,
  data: customData,
  id,
  resizeObserverConfig,
  transition = defaultTransition,
}: Arguments) {
  const {
    items,
    containerId,
    activeIndex,
    disabled: globalDisabled,
    overIndex,
    useDragOverlay,
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
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    setActivatorNodeRef,
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
  const isSorting = Boolean(active);
  const shouldDisplaceDragSource = !useDragOverlay && isDragging;
  const finalTransform = null;
  const newIndex = index;
  const activeId = active?.id;
  const previous = useRef({
    activeId,
    items,
    newIndex,
    containerId,
  });
  const itemsHaveChanged = items !== previous.current.items;
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: previous.current.newIndex,
    previousItems: previous.current.items,
    previousContainerId: previous.current.containerId,
    transition,
    wasDragging: previous.current.activeId != null,
  });

  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect,
  });

  useEffect(() => {
    if (isSorting && previous.current.newIndex !== newIndex) {
      previous.current.newIndex = newIndex;
    }

    if (containerId !== previous.current.containerId) {
      previous.current.containerId = containerId;
    }

    if (items !== previous.current.items) {
      previous.current.items = items;
    }
  }, [isSorting, newIndex, containerId, items]);

  useEffect(() => {
    if (activeId === previous.current.activeId) {
      return;
    }

    if (activeId && !previous.current.activeId) {
      previous.current.activeId = activeId;
      return;
    }

    const timeoutId = setTimeout(() => {
      previous.current.activeId = activeId;
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [activeId]);

  return {
    active,
    activeIndex,
    attributes,
    data,
    rect,
    index,
    newIndex,
    items,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
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
      (itemsHaveChanged && previous.current.newIndex === index)
    ) {
      return disabledTransition;
    }

    if (
      (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent)) ||
      !transition
    ) {
      return undefined;
    }

    if (isSorting || shouldAnimateLayoutChanges) {
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
