import React, {
  memo,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  add,
  Transform,
  useIsomorphicLayoutEffect,
  useNodeRef,
  useUniqueId,
} from '@dnd-kit/utilities';

import {
  Action,
  Context,
  DndContextDescriptor,
  getInitialState,
  reducer,
} from '../../store';
import type {Coordinates, ViewRect, LayoutRect, Translate} from '../../types';
import {
  useAutoScroller,
  useCachedNode,
  useCombineActivators,
  useLayoutRectMap,
  useScrollableAncestors,
  useClientRect,
  useClientRects,
  useScrollOffsets,
  useViewRect,
  SyntheticListener,
} from '../../hooks/utilities';
import {
  KeyboardSensor,
  PointerSensor,
  Sensor,
  SensorContext,
  SensorDescriptor,
  SensorHandler,
  SensorInstance,
} from '../../sensors';
import {
  adjustScale,
  CollisionDetection,
  defaultCoordinates,
  getAdjustedRect,
  getRectDelta,
  rectIntersection,
} from '../../utilities';
import {applyModifiers, Modifiers} from '../../modifiers';
import type {
  LayoutRectMap,
  DraggableNode,
  DraggableNodes,
  DroppableContainers,
} from '../../store/types';
import type {UniqueIdentifier} from '../../types';
import {
  Accessibility,
  Announcements,
  screenReaderInstructions as defaultScreenReaderInstructions,
  ScreenReaderInstructions,
} from '../Accessibility';

interface Active {
  id: UniqueIdentifier;
}

export interface DragStartEvent {
  active: Active;
}

export interface DragMoveEvent {
  active: Active;
  delta: Translate;
  draggingRect: ViewRect;
  droppableRects: LayoutRectMap;
  over: {
    id: UniqueIdentifier;
    rect: LayoutRect;
  } | null;
}

export interface DragOverEvent {
  active: Active;
  draggingRect: ViewRect;
  droppableRects: LayoutRectMap;
  over: {
    id: UniqueIdentifier;
    rect: LayoutRect;
  } | null;
}

export interface DragEndEvent {
  active: Active;
  delta: Translate;
  over: {
    id: UniqueIdentifier;
  } | null;
}

export type DragCancelEvent = DragEndEvent;

interface DndEvent extends Event {
  dndKit?: {
    capturedBy: Sensor<any>;
  };
}

interface Props {
  autoScroll?: boolean;
  announcements?: Announcements;
  children?: React.ReactNode;
  collisionDetection?: CollisionDetection;
  screenReaderInstructions?: ScreenReaderInstructions;
  sensors?: SensorDescriptor<any>[];
  modifiers?: Modifiers;
  onDragStart?(event: DragStartEvent): void;
  onDragMove?(event: DragMoveEvent): void;
  onDragOver?(event: DragOverEvent): void;
  onDragEnd?(event: DragEndEvent): void;
  onDragCancel?(event: DragCancelEvent): void;
}

const defaultSensors = [
  {sensor: PointerSensor, options: {}},
  {sensor: KeyboardSensor, options: {}},
];

export const ActiveDraggableContext = createContext<Transform>({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1,
});

export const DndContext = memo(function DndContext({
  autoScroll = true,
  announcements,
  children,
  sensors = defaultSensors,
  collisionDetection = rectIntersection,
  screenReaderInstructions = defaultScreenReaderInstructions,
  modifiers,
  ...props
}: Props) {
  const store = useReducer(reducer, undefined, getInitialState);
  const [state, dispatch] = store;
  const {
    draggable: {active, lastEvent, nodes: draggableNodes, translate},
    droppable: {containers: droppableContainers},
  } = state;
  const activeRef = useRef<UniqueIdentifier | null>(null);
  const [activeSensor, setActiveSensor] = useState<SensorInstance | null>(null);
  const [activatorEvent, setActivatorEvent] = useState<Event | null>(null);
  const latestProps = useRef(props);
  const draggableDescribedById = useUniqueId(`DndDescribedBy`);

  const {
    layoutRectMap: droppableRects,
    recomputeLayouts,
    willRecomputeLayouts,
  } = useLayoutRectMap(droppableContainers, active === null);
  const activeNode = useCachedNode(
    getDraggableNode(active, draggableNodes),
    active
  );
  const activeNodeRect = useViewRect(activeNode);
  const activeNodeClientRect = useClientRect(activeNode);
  const initialActiveNodeRectRef = useRef<ViewRect | null>(null);
  const initialActiveNodeRect = initialActiveNodeRectRef.current;
  const nodeRectDelta = getRectDelta(activeNodeRect, initialActiveNodeRect);
  const tracked = useRef<{
    active: UniqueIdentifier | null;
    droppableRects: LayoutRectMap;
    overId: UniqueIdentifier | null;
    scrollAdjustedTransalte: Coordinates;
    translatedRect: ViewRect | null;
  }>({
    active,
    droppableRects,
    overId: null,
    scrollAdjustedTransalte: defaultCoordinates,
    translatedRect: null,
  });
  const overNode = getDroppableNode(
    tracked.current.overId,
    droppableContainers
  );
  const windowRect = useClientRect(
    activeNode ? activeNode.ownerDocument.defaultView : null
  );
  const containerNodeRect = useClientRect(
    activeNode ? activeNode.parentElement : null
  );
  const scrollableAncestors = useScrollableAncestors(
    active ? overNode ?? activeNode : null
  );
  const scrollableAncestorRects = useClientRects(scrollableAncestors);

  const [overlayNodeRef, setOverlayNodeRef] = useNodeRef();
  const overlayNodeRect = useClientRect(
    active ? overlayNodeRef.current : null,
    willRecomputeLayouts
  );

  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1,
    },
    activeNodeRect: activeNodeClientRect,
    draggingNodeRect: overlayNodeRect ?? activeNodeClientRect,
    containerNodeRect,
    overlayNodeRect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect,
  });

  const scrolllAdjustment = useScrollOffsets(scrollableAncestors);

  const scrollAdjustedTransalte = add(modifiedTranslate, scrolllAdjustment);

  const translatedRect = activeNodeRect
    ? getAdjustedRect(activeNodeRect, modifiedTranslate)
    : null;

  const collisionRect = translatedRect
    ? getAdjustedRect(translatedRect, scrolllAdjustment)
    : null;

  const overId =
    active && collisionRect
      ? collisionDetection(Array.from(droppableRects.entries()), collisionRect)
      : null;
  const overNodeRect = getLayoutRect(overId, droppableRects);
  const over = useMemo(
    () =>
      overId && overNodeRect
        ? {
            id: overId,
            rect: overNodeRect,
          }
        : null,
    [overId, overNodeRect]
  );

  const transform = adjustScale(
    modifiedTranslate,
    overNodeRect,
    activeNodeRect
  );

  const sensorContext = useRef<SensorContext>({
    activeNode,
    collisionRect,
    droppableRects,
    droppableContainers,
    over,
    scrollableAncestors,
    translatedRect,
  });

  const instantiateSensor = useCallback(
    (
      event: React.SyntheticEvent,
      {sensor: Sensor, options}: SensorDescriptor<any>
    ) => {
      if (!activeRef.current) {
        return;
      }

      const activeNode = draggableNodes[activeRef.current];

      if (!activeNode) {
        return;
      }

      const sensorInstance = new Sensor({
        active: activeRef.current,
        activeNode,
        event: event.nativeEvent,
        options,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: sensorContext,
        onStart: (initialCoordinates) => {
          const id = activeRef.current;

          if (!id) {
            return;
          }

          const {onDragStart} = latestProps.current;

          dispatch({
            type: Action.DragStart,
            initialCoordinates,
            active: id,
          });

          onDragStart?.({active: {id}});
        },
        onMove(coordinates) {
          dispatch({
            type: Action.DragMove,
            coordinates,
          });
        },
        onEnd: createHandler(Action.DragEnd),
        onCancel: createHandler(Action.DragCancel),
      });

      setActiveSensor(sensorInstance);
      setActivatorEvent(event.nativeEvent);

      function createHandler(type: Action.DragEnd | Action.DragCancel) {
        return function handler() {
          const {overId, scrollAdjustedTransalte} = tracked.current;
          const props = latestProps.current;
          const activeId = activeRef.current;

          if (activeId) {
            activeRef.current = null;
          }

          dispatch({type});
          setActiveSensor(null);
          setActivatorEvent(null);

          const handler =
            type === Action.DragEnd ? props.onDragEnd : props.onDragCancel;

          if (activeId) {
            handler?.({
              active: {
                id: activeId,
              },
              delta: scrollAdjustedTransalte,
              over: overId
                ? {
                    id: overId,
                  }
                : null,
            });
          }
        };
      }
    },
    [dispatch, draggableNodes]
  );

  const bindActivatorToSensorInstantiator = useCallback(
    (
      handler: SensorHandler,
      sensor: SensorDescriptor<any>
    ): SyntheticListener['handler'] => {
      return (event, active) => {
        const nativeEvent = event.nativeEvent as DndEvent;

        if (
          // No active draggable
          activeRef.current !== null ||
          // Event has already been captured
          nativeEvent.dndKit ||
          nativeEvent.defaultPrevented
        ) {
          return;
        }

        if (handler(event, sensor.options) === true) {
          nativeEvent.dndKit = {
            capturedBy: sensor.sensor,
          };

          activeRef.current = active;
          instantiateSensor(event, sensor);
        }
      };
    },
    [instantiateSensor]
  );

  const activators = useCombineActivators(
    sensors,
    bindActivatorToSensorInstantiator
  );

  useIsomorphicLayoutEffect(
    () => {
      latestProps.current = props;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(props)
  );

  useIsomorphicLayoutEffect(() => {
    if (!active) {
      return;
    }

    // Recompute rects right after dragging has begun in case they have changed
    recomputeLayouts();
  }, [active, recomputeLayouts]);

  useEffect(() => {
    if (!active) {
      initialActiveNodeRectRef.current = null;
    }

    if (active && activeNodeRect && !initialActiveNodeRectRef.current) {
      initialActiveNodeRectRef.current = activeNodeRect;
    }
  }, [activeNodeRect, active]);

  useEffect(() => {
    const activeId = activeRef.current;

    if (!activeId) {
      return;
    }

    const {onDragMove} = latestProps.current;
    const {overId, droppableRects, translatedRect} = tracked.current;

    if (!onDragMove || !translatedRect) {
      return;
    }
    const overNodeRect = getLayoutRect(overId, droppableRects);

    onDragMove({
      active: {
        id: activeId,
      },
      draggingRect: translatedRect,
      droppableRects,
      delta: {
        x: scrollAdjustedTransalte.x,
        y: scrollAdjustedTransalte.y,
      },
      over:
        overId && overNodeRect
          ? {
              id: overId,
              rect: overNodeRect,
            }
          : null,
    });
  }, [scrollAdjustedTransalte.x, scrollAdjustedTransalte.y]);

  useEffect(() => {
    if (!activeRef.current) {
      return;
    }

    const {active, droppableRects, translatedRect} = tracked.current;

    if (!active || !translatedRect) {
      return;
    }

    const {onDragOver} = latestProps.current;
    const overNodeRect = getLayoutRect(overId, droppableRects);

    onDragOver?.({
      active: {
        id: active,
      },
      droppableRects: tracked.current.droppableRects,
      draggingRect: translatedRect,
      over:
        overId && overNodeRect
          ? {
              id: overId,
              rect: overNodeRect,
            }
          : null,
    });
  }, [overId]);

  useEffect(() => {
    tracked.current = {
      active,
      droppableRects,
      overId,
      translatedRect,
      scrollAdjustedTransalte,
    };
  }, [active, droppableRects, overId, translatedRect, scrollAdjustedTransalte]);

  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      activeNode,
      collisionRect,
      droppableRects,
      droppableContainers,
      over,
      scrollableAncestors,
      translatedRect,
    };
  }, [
    activeNode,
    collisionRect,
    droppableRects,
    droppableContainers,
    over,
    scrollableAncestors,
    translatedRect,
  ]);

  useAutoScroller({
    draggingRect: translatedRect,
    disabled: !autoScroll || !activeSensor?.autoScrollEnabled,
    scrollableAncestors,
    scrollableAncestorRects,
  });

  const contextValue = useMemo(() => {
    const memoizedContext: DndContextDescriptor = {
      active,
      activeNode,
      activeNodeRect,
      activeNodeClientRect,
      activatorEvent,
      activators,
      ariaDescribedById: {
        draggable: draggableDescribedById,
      },
      overlayNode: {
        nodeRef: overlayNodeRef,
        rect: overlayNodeRect,
        setRef: setOverlayNodeRef,
      },
      containerNodeRect,
      dispatch,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      recomputeLayouts,
      scrollableAncestors,
      scrollableAncestorRects,
      willRecomputeLayouts,
      windowRect,
    };

    return memoizedContext;
  }, [
    active,
    activeNode,
    activeNodeClientRect,
    activeNodeRect,
    activatorEvent,
    activators,
    containerNodeRect,
    overlayNodeRect,
    overlayNodeRef,
    dispatch,
    draggableNodes,
    draggableDescribedById,
    droppableContainers,
    droppableRects,
    over,
    recomputeLayouts,
    scrollableAncestors,
    scrollableAncestorRects,
    setOverlayNodeRef,
    willRecomputeLayouts,
    windowRect,
  ]);

  return (
    <>
      <Context.Provider value={contextValue}>
        <ActiveDraggableContext.Provider value={transform}>
          {children}
        </ActiveDraggableContext.Provider>
      </Context.Provider>
      <Accessibility
        announcements={announcements}
        activeId={active}
        overId={overId}
        lastEvent={lastEvent}
        hiddenTextDescribedById={draggableDescribedById}
        screenReaderInstructions={screenReaderInstructions}
      />
    </>
  );
});

function getDroppableNode(
  id: UniqueIdentifier | null,
  droppableContainers: DroppableContainers
): HTMLElement | null {
  return id ? droppableContainers[id]?.node.current ?? null : null;
}

function getDraggableNode(
  id: UniqueIdentifier | null,
  droppableContainers: DraggableNodes
): DraggableNode | null {
  return id ? droppableContainers[id] ?? null : null;
}

function getLayoutRect(
  id: UniqueIdentifier | null,
  layoutRectMap: LayoutRectMap
): LayoutRect | null {
  return id ? layoutRectMap.get(id) ?? null : null;
}
