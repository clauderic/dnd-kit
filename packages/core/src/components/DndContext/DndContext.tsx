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
import {unstable_batchedUpdates} from 'react-dom';
import {
  add,
  getEventCoordinates,
  Transform,
  useIsomorphicLayoutEffect,
  useUniqueId,
} from '@dnd-kit/utilities';

import {
  Action,
  Context,
  DndContextDescriptor,
  getInitialState,
  reducer,
} from '../../store';
import type {ViewRect} from '../../types';
import {DndMonitorContext, DndMonitorState} from '../../hooks/monitor';
import {
  useAutoScroller,
  useCachedNode,
  useCombineActivators,
  useDragOverlayMeasuring,
  useDroppableMeasuring,
  useScrollableAncestors,
  useClientRect,
  useClientRects,
  useRect,
  useScrollOffsets,
} from '../../hooks/utilities';
import type {
  AutoScrollOptions,
  DroppableMeasuring,
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
  getViewRect,
  rectIntersection,
} from '../../utilities';
import {applyModifiers, Modifiers} from '../../modifiers';
import {Active, DataRef, Over} from '../../store/types';
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
  id?: string;
  autoScroll?: boolean | AutoScrollOptions;
  announcements?: Announcements;
  cancelDrop?: CancelDrop;
  children?: React.ReactNode;
  collisionDetection?: CollisionDetection;
  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
  screenReaderInstructions?: ScreenReaderInstructions;
  sensors?: SensorDescriptor<any>[];
  onDragStart?(event: DragStartEvent): void;
  onDragMove?(event: DragMoveEvent): void;
  onDragOver?(event: DragOverEvent): void;
  onDragEnd?(event: DragEndEvent): void;
  onDragCancel?(event: DragCancelEvent): void;
}

export interface DraggableMeasuring {
  measure(node: HTMLElement): ViewRect;
}

export interface MeasuringConfiguration {
  draggable?: Partial<DraggableMeasuring>;
  droppable?: Partial<DroppableMeasuring>;
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

const defaultData: DataRef = {current: {}};

export const ActiveDraggableContext = createContext<Transform>({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1,
});

export const DndContext = memo(function DndContext({
  id,
  autoScroll = true,
  announcements,
  children,
  sensors = defaultSensors,
  collisionDetection = rectIntersection,
  measuring,
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
  const [isDragging, setIsDragging] = useState(false);
  const {
    draggable: {active: activeId, nodes: draggableNodes, translate},
    droppable: {containers: droppableContainers},
  } = state;
  const node = activeId ? draggableNodes[activeId] : null;
  const activeRects = useRef<Active['rect']['current']>({
    initial: null,
    translated: null,
  });
  const active = useMemo<Active | null>(
    () =>
      activeId != null
        ? {
            id: activeId,
            // It's possible for the active node to unmount while dragging
            data: node?.data ?? defaultData,
            rect: activeRects,
          }
        : null,
    [activeId, node]
  );
  const activeRef = useRef<UniqueIdentifier | null>(null);
  const [activeSensor, setActiveSensor] = useState<SensorInstance | null>(null);
  const [activatorEvent, setActivatorEvent] = useState<Event | null>(null);
  const latestProps = useRef(props);
  const draggableDescribedById = useUniqueId(`DndDescribedBy`, id);
  const enabledDroppableContainers = useMemo(() => {
    return droppableContainers.getEnabled();
  }, [droppableContainers]);
  const {
    layoutRectMap: droppableRects,
    recomputeLayouts,
    willRecomputeLayouts,
  } = useDroppableMeasuring(enabledDroppableContainers, {
    dragging: isDragging,
    dependencies: [translate.x, translate.y],
    config: measuring?.droppable,
  });
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = activatorEvent
    ? getEventCoordinates(activatorEvent)
    : null;
  const activeNodeRect = useRect(
    activeNode,
    measuring?.draggable?.measure ?? getViewRect
  );
  const activeNodeClientRect = useClientRect(activeNode);
  const initialActiveNodeRectRef = useRef<ViewRect | null>(null);
  const initialActiveNodeRect = initialActiveNodeRectRef.current;
  const sensorContext = useRef<SensorContext>({
    active: null,
    activeNode,
    collisionRect: null,
    droppableRects,
    draggableNodes,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null,
    translatedRect: null,
  });
  const overNode = droppableContainers.getNodeFor(
    sensorContext.current.over?.id
  );
  const windowRect = useClientRect(
    activeNode ? activeNode.ownerDocument.defaultView : null
  );
  const containerNodeRect = useClientRect(
    activeNode ? activeNode.parentElement : null
  );
  const scrollableAncestors = useScrollableAncestors(
    activeId ? overNode ?? activeNode : null
  );
  const scrollableAncestorRects = useClientRects(scrollableAncestors);

  const dragOverlay = useDragOverlayMeasuring({
    disabled: activeId == null,
    forceRecompute: willRecomputeLayouts,
  });

  // Use the rect of the drag overlay if it is mounted
  const draggingNodeRect = dragOverlay.rect ?? activeNodeRect;

  // The delta between the previous and new position of the draggable node
  // is only relevant when there is no drag overlay
  const nodeRectDelta =
    draggingNodeRect === activeNodeRect
      ? getRectDelta(activeNodeRect, initialActiveNodeRect)
      : defaultCoordinates;

  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1,
    },
    activatorEvent,
    active,
    activeNodeRect: activeNodeClientRect,
    containerNodeRect,
    draggingNodeRect,
    over: sensorContext.current.over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect,
  });

  const pointerCoordinates = activationCoordinates
    ? add(activationCoordinates, translate)
    : null;

  const scrollAdjustment = useScrollOffsets(scrollableAncestors);

  const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);

  const translatedRect = draggingNodeRect
    ? getAdjustedRect(draggingNodeRect, modifiedTranslate)
    : null;

  const collisionRect = translatedRect
    ? getAdjustedRect(translatedRect, scrollAdjustment)
    : null;
  const overId =
    active && collisionRect
      ? collisionDetection({
          active,
          collisionRect,
          droppableContainers: enabledDroppableContainers,
        })
      : null;
  const [over, setOver] = useState<Over | null>(null);

  const transform = adjustScale(
    modifiedTranslate,
    over?.rect ?? null,
    activeNodeRect
  );

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
        onStart(initialCoordinates) {
          const id = activeRef.current;

          if (!id) {
            return;
          }

          const node = draggableNodes[id];

          if (!node) {
            return;
          }

          const {onDragStart} = latestProps.current;
          const event: DragStartEvent = {
            active: {id, data: node.data, rect: activeRects},
          };

          unstable_batchedUpdates(() => {
            dispatch({
              type: Action.DragStart,
              initialCoordinates,
              active: id,
            });
            setMonitorState({type: Action.DragStart, event});
          });

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

      unstable_batchedUpdates(() => {
        setActiveSensor(sensorInstance);
        setActivatorEvent(event.nativeEvent);
      });

      function createHandler(type: Action.DragEnd | Action.DragCancel) {
        return async function handler() {
          const {active, over, scrollAdjustedTranslate} = sensorContext.current;
          let event: DragEndEvent | null = null;

          if (active && scrollAdjustedTranslate) {
            const {cancelDrop} = latestProps.current;

            event = {
              active: active,
              delta: scrollAdjustedTranslate,
              over,
            };

            if (type === Action.DragEnd && typeof cancelDrop === 'function') {
              const shouldCancel = await Promise.resolve(cancelDrop(event));

              if (shouldCancel) {
                type = Action.DragCancel;
              }
            }
          }

          activeRef.current = null;

          unstable_batchedUpdates(() => {
            dispatch({type});
            setIsDragging(false);
            setActiveSensor(null);
            setActivatorEvent(null);

            if (event) {
              setMonitorState({type, event});
            }
          });

          if (event) {
            const {onDragCancel, onDragEnd} = latestProps.current;
            const handler = type === Action.DragEnd ? onDragEnd : onDragCancel;

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
    if (activeId != null) {
      setIsDragging(true);
    }
  }, [activeId]);

  useEffect(() => {
    if (!active) {
      initialActiveNodeRectRef.current = null;
    }

    if (active && activeNodeRect && !initialActiveNodeRectRef.current) {
      initialActiveNodeRectRef.current = activeNodeRect;
    }
  }, [activeNodeRect, active]);

  useEffect(() => {
    const {onDragMove} = latestProps.current;
    const {active, over} = sensorContext.current;

    if (!active) {
      return;
    }

    const event: DragMoveEvent = {
      active,
      delta: {
        x: scrollAdjustedTranslate.x,
        y: scrollAdjustedTranslate.y,
      },
      over,
    };

    setMonitorState({type: Action.DragMove, event});
    onDragMove?.(event);
  }, [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]);

  useEffect(
    () => {
      const {
        active,
        droppableContainers,
        scrollAdjustedTranslate,
      } = sensorContext.current;

      if (!active || !activeRef.current || !scrollAdjustedTranslate) {
        return;
      }

      const {onDragOver} = latestProps.current;
      const overContainer = droppableContainers.get(overId);
      const over =
        overContainer && overContainer.rect.current
          ? {
              id: overContainer.id,
              rect: overContainer.rect.current,
              data: overContainer.data,
              disabled: overContainer.disabled,
            }
          : null;
      const event: DragOverEvent = {
        active,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y,
        },
        over,
      };

      unstable_batchedUpdates(() => {
        setOver(over);
        setMonitorState({type: Action.DragOver, event});
        onDragOver?.(event);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overId]
  );

  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      active,
      activeNode,
      collisionRect,
      droppableRects,
      draggableNodes,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate: scrollAdjustedTranslate,
      translatedRect,
    };

    activeRects.current = {
      initial: draggingNodeRect,
      translated: translatedRect,
    };
  }, [
    active,
    activeNode,
    collisionRect,
    draggableNodes,
    draggingNodeRect,
    droppableRects,
    droppableContainers,
    over,
    scrollableAncestors,
    scrollAdjustedTranslate,
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
      containerNodeRect,
      dispatch,
      dragOverlay,
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
    dragOverlay,
    dispatch,
    draggableNodes,
    draggableDescribedById,
    droppableContainers,
    droppableRects,
    over,
    recomputeLayouts,
    scrollableAncestors,
    scrollableAncestorRects,
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
