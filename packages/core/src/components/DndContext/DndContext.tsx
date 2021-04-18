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
import type {Coordinates, ViewRect, LayoutRect} from '../../types';
import {DndMonitorContext, DndMonitorState} from '../../hooks/monitor';
import {
  useAutoScroller,
  useCachedNode,
  useCombineActivators,
  useLayoutMeasuring,
  useScrollableAncestors,
  useClientRect,
  useClientRects,
  useScrollOffsets,
  useViewRect,
} from '../../hooks/utilities';
import type {
  AutoScrollOptions,
  LayoutMeasuring,
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
  getEventCoordinates,
  rectIntersection,
} from '../../utilities';
import {applyModifiers, Modifiers} from '../../modifiers';
import type {
  LayoutRectMap,
  DraggableNode,
  DraggableNodes,
  DroppableContainers,
} from '../../store/types';
import type {
  DragStartEvent,
  DragCancelEvent,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '../../types';
import {
  Accessibility,
  Announcements,
  screenReaderInstructions as defaultScreenReaderInstructions,
  ScreenReaderInstructions,
} from '../Accessibility';

export interface Props {
  autoScroll?: boolean | AutoScrollOptions;
  announcements?: Announcements;
  cancelDrop?: CancelDrop;
  children?: React.ReactNode;
  collisionDetection?: CollisionDetection;
  layoutMeasuring?: Partial<LayoutMeasuring>;
  modifiers?: Modifiers;
  screenReaderInstructions?: ScreenReaderInstructions;
  sensors?: SensorDescriptor<any>[];
  onDragStart?(event: DragStartEvent): void;
  onDragMove?(event: DragMoveEvent): void;
  onDragOver?(event: DragOverEvent): void;
  onDragEnd?(event: DragEndEvent): void;
  onDragCancel?(event: DragCancelEvent): void;
}

export interface CancelDropArguments extends DragEndEvent {}

export type CancelDrop = (
  args: CancelDropArguments
) => boolean | Promise<boolean>;

interface DndEvent extends Event {
  dndKit?: {
    capturedBy: Sensor<any>;
  };
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
  layoutMeasuring,
  modifiers,
  screenReaderInstructions = defaultScreenReaderInstructions,
  ...props
}: Props) {
  const store = useReducer(reducer, undefined, getInitialState);
  const [state, dispatch] = store;
  const [monitorState, setMonitorState] = useState<DndMonitorState>(() => ({
    type: null,
    event: null,
  }));
  const {
    draggable: {active, nodes: draggableNodes, translate},
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
  } = useLayoutMeasuring(droppableContainers, {
    dragging: active != null,
    dependencies: [translate.x, translate.y],
    config: layoutMeasuring,
  });
  const activeNode = useCachedNode(
    getDraggableNode(active, draggableNodes),
    active
  );
  const activationCoordinates = activatorEvent
    ? getEventCoordinates(activatorEvent)
    : null;
  const activeNodeRect = useViewRect(activeNode);
  const activeNodeClientRect = useClientRect(activeNode);
  const initialActiveNodeRectRef = useRef<ViewRect | null>(null);
  const initialActiveNodeRect = initialActiveNodeRectRef.current;
  const nodeRectDelta = getRectDelta(activeNodeRect, initialActiveNodeRect);
  const tracked = useRef<{
    active: UniqueIdentifier | null;
    activeNodeRect: LayoutRect | null;
    droppableRects: LayoutRectMap;
    overId: UniqueIdentifier | null;
    scrollAdjustedTransalte: Coordinates;
    translatedRect: ViewRect | null;
  }>({
    active,
    activeNodeRect,
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

  const pointerCoordinates = activationCoordinates
    ? add(activationCoordinates, translate)
    : null;

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
    scrollAdjustedTransalte,
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
          const event: DragStartEvent = {active: {id}};

          dispatch({
            type: Action.DragStart,
            initialCoordinates,
            active: id,
          });
          setMonitorState({type: Action.DragStart, event});
          onDragStart?.(event);
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
        return async function handler() {
          const activeId = activeRef.current;

          const {
            activeNodeRect,
            droppableRects,
            overId,
            scrollAdjustedTransalte,
            translatedRect,
          } = tracked.current;

          if (!activeId || !activeNodeRect || !translatedRect) {
            return;
          }

          const {cancelDrop} = latestProps.current;
          const overNodeRect = getLayoutRect(overId, droppableRects);
          const event: DragEndEvent = {
            active: {
              id: activeId,
              rect: {
                initial: activeNodeRect,
                translated: translatedRect,
              },
            },
            delta: scrollAdjustedTransalte,
            over:
              overId && overNodeRect
                ? {
                    id: overId,
                    rect: overNodeRect,
                  }
                : null,
          };
          activeRef.current = null;

          if (type === Action.DragEnd && typeof cancelDrop === 'function') {
            const shouldCancel = await Promise.resolve(cancelDrop(event));

            if (shouldCancel) {
              type = Action.DragCancel;
            }
          }

          dispatch({type});
          setActiveSensor(null);
          setActivatorEvent(null);

          const {onDragCancel, onDragEnd} = latestProps.current;
          const handler = type === Action.DragEnd ? onDragEnd : onDragCancel;

          setMonitorState({type, event});

          if (activeId) {
            handler?.(event);
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
    const {onDragMove} = latestProps.current;
    const {
      activeNodeRect,
      overId,
      droppableRects,
      translatedRect,
    } = tracked.current;

    if (!activeId || !activeNodeRect || !translatedRect) {
      return;
    }

    const overNodeRect = getLayoutRect(overId, droppableRects);
    const event: DragMoveEvent = {
      active: {
        id: activeId,
        rect: {
          initial: activeNodeRect,
          translated: translatedRect,
        },
      },
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
    };

    setMonitorState({type: Action.DragMove, event});
    onDragMove?.(event);
  }, [scrollAdjustedTransalte.x, scrollAdjustedTransalte.y]);

  useEffect(() => {
    if (!activeRef.current) {
      return;
    }

    const {
      active,
      activeNodeRect,
      droppableRects,
      scrollAdjustedTransalte,
      translatedRect,
    } = tracked.current;

    if (!active || !activeNodeRect || !translatedRect) {
      return;
    }

    const {onDragOver} = latestProps.current;
    const overNodeRect = getLayoutRect(overId, droppableRects);
    const event: DragOverEvent = {
      active: {
        id: active,
        rect: {
          initial: activeNodeRect,
          translated: translatedRect,
        },
      },
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
    };

    setMonitorState({type: Action.DragOver, event});
    onDragOver?.(event);
  }, [overId]);

  useEffect(() => {
    tracked.current = {
      active,
      activeNodeRect,
      droppableRects,
      overId,
      scrollAdjustedTransalte,
      translatedRect,
    };
  }, [
    active,
    activeNodeRect,
    droppableRects,
    overId,
    scrollAdjustedTransalte,
    translatedRect,
  ]);

  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      activeNode,
      collisionRect,
      droppableRects,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTransalte,
      translatedRect,
    };
  }, [
    activeNode,
    collisionRect,
    droppableRects,
    droppableContainers,
    over,
    scrollableAncestors,
    scrollAdjustedTransalte,
    translatedRect,
  ]);

  useAutoScroller({
    ...getAutoScrollerOptions(),
    draggingRect: translatedRect,
    pointerCoordinates,
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
    <DndMonitorContext.Provider value={monitorState}>
      <Context.Provider value={contextValue}>
        <ActiveDraggableContext.Provider value={transform}>
          {children}
        </ActiveDraggableContext.Provider>
      </Context.Provider>
      <Accessibility
        announcements={announcements}
        hiddenTextDescribedById={draggableDescribedById}
        screenReaderInstructions={screenReaderInstructions}
      />
    </DndMonitorContext.Provider>
  );

  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoscroll =
      activeSensor?.autoScrollEnabled === false;
    const autoScrollGloballyDisabled =
      typeof autoScroll === 'object'
        ? autoScroll.enabled === false
        : autoScroll === false;
    const enabled =
      !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;

    if (typeof autoScroll === 'object') {
      return {
        ...autoScroll,
        enabled,
      };
    }

    return {enabled};
  }
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
