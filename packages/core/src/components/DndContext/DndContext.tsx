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
  useLatestValue,
  useIsomorphicLayoutEffect,
  useUniqueId,
} from '@dnd-kit/utilities';

import {
  Action,
  PublicContext,
  InternalContext,
  PublicContextDescriptor,
  InternalContextDescriptor,
  getInitialState,
  reducer,
} from '../../store';
import {DndMonitorContext, DndMonitorState} from '../../hooks/monitor';
import {
  useAutoScroller,
  useCachedNode,
  useCombineActivators,
  useDragOverlayMeasuring,
  useDroppableMeasuring,
  useScrollableAncestors,
  useSensorSetup,
  useRects,
  useWindowRect,
  useObservedRect,
  useScrollOffsets,
  useScrollOffsetsDelta,
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
  getFirstCollision,
  rectIntersection,
} from '../../utilities';
import {getTransformAgnosticClientRect} from '../../utilities/rect';
import {applyModifiers, Modifiers} from '../../modifiers';
import type {Active, DataRef, Over} from '../../store/types';
import type {
  ClientRect,
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

interface Measuring {
  measure(node: HTMLElement): ClientRect;
}

export interface DraggableMeasuring extends Measuring {}

export interface DragOverlayMeasuring extends Measuring {}

export interface MeasuringConfiguration {
  draggable?: Partial<DraggableMeasuring>;
  droppable?: Partial<DroppableMeasuring>;
  dragOverlay?: Partial<DragOverlayMeasuring>;
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
  const latestProps = useLatestValue(props, Object.values(props));
  const draggableDescribedById = useUniqueId(`DndDescribedBy`, id);
  const enabledDroppableContainers = useMemo(
    () => droppableContainers.getEnabled(),
    [droppableContainers]
  );
  const {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled,
  } = useDroppableMeasuring(enabledDroppableContainers, {
    dragging: isDragging,
    dependencies: [translate.x, translate.y],
    config: measuring?.droppable,
  });
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = activatorEvent
    ? getEventCoordinates(activatorEvent)
    : null;
  const activeNodeRect = useObservedRect(
    activeNode,
    measuring?.draggable?.measure ?? getTransformAgnosticClientRect
  );
  const containerNodeRect = useObservedRect(
    activeNode ? activeNode.parentElement : null
  );
  const sensorContext = useRef<SensorContext>({
    active: null,
    activeNode,
    collisionRect: null,
    collisions: null,
    droppableRects,
    draggableNodes,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null,
  });
  const overNode = droppableContainers.getNodeFor(
    sensorContext.current.over?.id
  );
  const dragOverlay = useDragOverlayMeasuring({
    measure: measuring?.dragOverlay?.measure,
  });

  // Use the rect of the drag overlay if it is mounted
  const draggingNode = dragOverlay.nodeRef.current ?? activeNode;
  const draggingNodeRect = dragOverlay.rect ?? activeNodeRect;
  const usesDragOverlay = dragOverlay.nodeRef.current && dragOverlay.rect;
  const initialActiveNodeRectRef = useRef<ClientRect | null>(null);
  const initialActiveNodeRect = initialActiveNodeRectRef.current;
  const nodeRectDelta = usesDragOverlay
    ? defaultCoordinates
    : // The delta between the previous and new position of the draggable node
      // is only relevant when there is no drag overlay
      getRectDelta(activeNodeRect, initialActiveNodeRect);

  // Get the window rect of the dragging node
  const windowRect = useWindowRect(
    draggingNode ? draggingNode.ownerDocument.defaultView : null
  );

  // Get scrollable ancestors of the dragging node
  const scrollableAncestors = useScrollableAncestors(
    activeId ? overNode ?? draggingNode : null
  );
  const scrollableAncestorRects = useRects(scrollableAncestors);

  // Apply modifiers
  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1,
    },
    activatorEvent,
    active,
    activeNodeRect,
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

  const scrollOffsets = useScrollOffsets(scrollableAncestors);
  // Represents the scroll delta since dragging was initiated
  const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
  // Represents the scroll delta since the last time the active node rect was measured
  const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [
    activeNodeRect,
  ]);

  const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);

  const collisionRect = draggingNodeRect
    ? getAdjustedRect(draggingNodeRect, modifiedTranslate)
    : null;

  const collisions =
    active && collisionRect
      ? collisionDetection({
          active,
          collisionRect,
          droppableRects,
          droppableContainers: enabledDroppableContainers,
          pointerCoordinates,
        })
      : null;
  const overId = getFirstCollision(collisions, 'id');
  const [over, setOver] = useState<Over | null>(null);

  // When there is no drag overlay used, we need to account for the
  // window scroll delta
  const appliedTranslate = usesDragOverlay
    ? modifiedTranslate
    : add(modifiedTranslate, activeNodeScrollDelta);

  const transform = adjustScale(
    appliedTranslate,
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
          const {
            active,
            collisions,
            over,
            scrollAdjustedTranslate,
          } = sensorContext.current;
          let event: DragEndEvent | null = null;

          if (active && scrollAdjustedTranslate) {
            const {cancelDrop} = latestProps.current;

            event = {
              active: active,
              collisions,
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
            setOver(null);
            setIsDragging(false);
            setActiveSensor(null);
            setActivatorEvent(null);

            if (event) {
              setMonitorState({type, event});
            }

            if (event) {
              const {onDragCancel, onDragEnd} = latestProps.current;
              const handler =
                type === Action.DragEnd ? onDragEnd : onDragCancel;

              handler?.(event);
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes]
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

  useSensorSetup(sensors);

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

  useEffect(
    () => {
      const {onDragMove} = latestProps.current;
      const {active, collisions, over} = sensorContext.current;

      if (!active) {
        return;
      }

      const event: DragMoveEvent = {
        active,
        collisions,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y,
        },
        over,
      };

      setMonitorState({type: Action.DragMove, event});
      onDragMove?.(event);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]
  );

  useEffect(
    () => {
      const {
        active,
        collisions,
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
        collisions,
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
      collisions,
      droppableRects,
      draggableNodes,
      draggingNode,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate,
    };

    activeRects.current = {
      initial: draggingNodeRect,
      translated: collisionRect,
    };
  }, [
    active,
    activeNode,
    collisions,
    collisionRect,
    draggableNodes,
    draggingNode,
    draggingNodeRect,
    droppableRects,
    droppableContainers,
    over,
    scrollableAncestors,
    scrollAdjustedTranslate,
  ]);

  useAutoScroller({
    ...getAutoScrollerOptions(),
    draggingRect: collisionRect,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects,
  });

  const publicContext = useMemo(() => {
    const context: PublicContextDescriptor = {
      active,
      activeNode,
      activeNodeRect,
      activatorEvent,
      collisions,
      containerNodeRect,
      dragOverlay,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      measureDroppableContainers,
      scrollableAncestors,
      scrollableAncestorRects,
      measuringScheduled,
      windowRect,
    };

    return context;
  }, [
    active,
    activeNode,
    activeNodeRect,
    activatorEvent,
    collisions,
    containerNodeRect,
    dragOverlay,
    draggableNodes,
    droppableContainers,
    droppableRects,
    over,
    measureDroppableContainers,
    scrollableAncestors,
    scrollableAncestorRects,
    measuringScheduled,
    windowRect,
  ]);

  const internalContext = useMemo(() => {
    const context: InternalContextDescriptor = {
      activatorEvent,
      activators,
      active,
      activeNodeRect,
      ariaDescribedById: {
        draggable: draggableDescribedById,
      },
      dispatch,
      draggableNodes,
      over,
      measureDroppableContainers,
    };

    return context;
  }, [
    activatorEvent,
    activators,
    active,
    activeNodeRect,
    dispatch,
    draggableDescribedById,
    draggableNodes,
    over,
    measureDroppableContainers,
  ]);

  return (
    <DndMonitorContext.Provider value={monitorState}>
      <InternalContext.Provider value={internalContext}>
        <PublicContext.Provider value={publicContext}>
          <ActiveDraggableContext.Provider value={transform}>
            {children}
          </ActiveDraggableContext.Provider>
        </PublicContext.Provider>
      </InternalContext.Provider>
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
