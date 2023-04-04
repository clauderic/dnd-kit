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
  getWindow,
  useLatestValue,
  useIsomorphicLayoutEffect,
  useUniqueId,
} from '@dnd-kit/utilities';
import type {Transform} from '@dnd-kit/utilities';

import {
  Action,
  PublicContext,
  InternalContext,
  PublicContextDescriptor,
  InternalContextDescriptor,
  getInitialState,
  reducer,
} from '../../store';
import {DndMonitorContext, useDndMonitorProvider} from '../DndMonitor';
import {
  useAutoScroller,
  useCombineActivators,
  useDragOverlayMeasuring,
  useDroppableMeasuring,
  useRect,
  useRectDelta,
  useRects,
  useScrollableAncestors,
  useScrollOffsets,
  useScrollOffsetsDelta,
  useSensorSetup,
  useWindowRect,
} from '../../hooks/utilities';
import type {AutoScrollOptions, SyntheticListener} from '../../hooks/utilities';
import type {
  Sensor,
  SensorContext,
  SensorDescriptor,
  SensorActivatorFunction,
  SensorInstance,
} from '../../sensors';
import {
  adjustScale,
  CollisionDetection,
  defaultCoordinates,
  getAdjustedRect,
  getFirstCollision,
  rectIntersection,
} from '../../utilities';
import {applyModifiers, Modifiers} from '../../modifiers';
import type {Active} from '../../store/types';
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
  RestoreFocus,
  ScreenReaderInstructions,
} from '../Accessibility';

import {defaultSensors} from './defaults';
import {
  useLayoutShiftScrollCompensation,
  useMeasuringConfiguration,
} from './hooks';
import type {MeasuringConfiguration} from './types';
import {createActiveAndOverAPI} from './activeAndOverAPI';
import {useActiveNodeDomValues} from './useActiveNodeDomValues';

export interface Props {
  id?: string;
  accessibility?: {
    announcements?: Announcements;
    container?: Element;
    restoreFocus?: boolean;
    screenReaderInstructions?: ScreenReaderInstructions;
  };
  autoScroll?: boolean | AutoScrollOptions;
  cancelDrop?: CancelDrop;
  children?: React.ReactNode;
  collisionDetection?: CollisionDetection;
  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
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

export const ActiveDraggableContext = createContext<Transform>({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1,
});

enum Status {
  Uninitialized,
  Initializing,
  Initialized,
}

export const DndContext = memo(function DndContext({
  id,
  accessibility,
  autoScroll = true,
  children,
  sensors = defaultSensors,
  collisionDetection = rectIntersection,
  measuring,
  modifiers,
  ...props
}: Props) {
  const store = useReducer(reducer, undefined, getInitialState);
  const [state, dispatch] = store;
  const [dispatchMonitorEvent, registerMonitorListener] =
    useDndMonitorProvider();
  const [status, setStatus] = useState<Status>(Status.Uninitialized);
  const isInitialized = status === Status.Initialized;
  const {
    draggable: {translate},
    droppable: {containers: droppableContainers},
  } = state;
  const activeRects = useRef<Active['rect']['current']>({
    initial: null,
    translated: null,
  });

  const activeAndOverAPI = useMemo(
    () => createActiveAndOverAPI(activeRects),
    []
  );
  const draggableNodes = activeAndOverAPI.draggableNodes;
  const active = activeAndOverAPI.useActive();
  const activeId = active?.id || null;

  const activatorEvent = activeAndOverAPI.useActivatorEvent();

  const activeRef = useRef<UniqueIdentifier | null>(null);
  const [activeSensor, setActiveSensor] = useState<SensorInstance | null>(null);
  const latestProps = useLatestValue(props, Object.values(props));
  const draggableDescribedById = useUniqueId(`DndDescribedBy`, id);
  const enabledDroppableContainers = useMemo(
    () => droppableContainers.getEnabled(),
    [droppableContainers]
  );
  const measuringConfiguration = useMeasuringConfiguration(measuring);
  const {droppableRects, measureDroppableContainers, measuringScheduled} =
    useDroppableMeasuring(enabledDroppableContainers, {
      dragging: isInitialized,
      dependencies: [translate.x, translate.y],
      config: measuringConfiguration.droppable,
    });

  const activeNodeDomValues = useActiveNodeDomValues(
    draggableNodes,
    measuringConfiguration,
    active?.id || null
  );
  const activeNode = activeNodeDomValues?.activeNode || null;
  const initialActiveNodeRect =
    activeNodeDomValues?.initialActiveNodeRect || null;
  const activeNodeRect = activeNodeDomValues?.activeNodeRect || null;
  const containerNodeRect = useRect(
    activeNode ? activeNode.parentElement : null
  );

  const activationCoordinates = useMemo(
    () => (activatorEvent ? getEventCoordinates(activatorEvent) : null),
    [activatorEvent]
  );
  const autoScrollOptions = getAutoScrollerOptions();

  useLayoutShiftScrollCompensation({
    activeNode: activeId ? draggableNodes.get(activeId) : null,
    config: autoScrollOptions.layoutShiftCompensation,
    initialRect: initialActiveNodeRect,
    measure: measuringConfiguration.draggable.measure,
  });

  const sensorContext = useRef<SensorContext>({
    activatorEvent: null,
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
    measure: measuringConfiguration.dragOverlay.measure,
  });

  // Use the rect of the drag overlay if it is mounted
  const draggingNode = dragOverlay.nodeRef.current ?? activeNode;
  const draggingNodeRect = isInitialized
    ? dragOverlay.rect ?? activeNodeRect
    : null;
  const usesDragOverlay = Boolean(
    dragOverlay.nodeRef.current && dragOverlay.rect
  );
  // The delta between the previous and new position of the draggable node
  // is only relevant when there is no drag overlay
  const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);

  // Get the window rect of the dragging node
  const windowRect = useWindowRect(
    draggingNode ? getWindow(draggingNode) : null
  );

  // Get scrollable ancestors of the dragging node
  const scrollableAncestors = useScrollableAncestors(
    isInitialized ? overNode ?? activeNode : null
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
  const over = activeAndOverAPI.useOver();

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
      if (activeRef.current == null) {
        return;
      }

      const activeNode = draggableNodes.get(activeRef.current);

      if (!activeNode) {
        return;
      }

      const activatorEvent = event.nativeEvent;

      const sensorInstance = new Sensor({
        active: activeRef.current,
        activeNode,
        event: activatorEvent,
        options,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: sensorContext,
        onStart(initialCoordinates) {
          const id = activeRef.current;

          if (id == null) {
            return;
          }

          const draggableNode = draggableNodes.get(id);

          if (!draggableNode) {
            return;
          }

          const {onDragStart} = latestProps.current;
          const event: DragStartEvent = {
            active: {id, data: draggableNode.data, rect: activeRects},
          };

          unstable_batchedUpdates(() => {
            onDragStart?.(event);
            setStatus(Status.Initializing);
            activeAndOverAPI.setActive(id);
            dispatch({
              type: Action.SetInitiailCoordinates,
              initialCoordinates,
            });
            dispatchMonitorEvent({type: 'onDragStart', event});
          });
        },
        onMove(coordinates) {
          dispatch({
            type: Action.DragMove,
            coordinates,
          });
        },
        onEnd: createHandler('DragEnd'),
        onCancel: createHandler('DragCancel'),
      });

      unstable_batchedUpdates(() => {
        setActiveSensor(sensorInstance);
        activeAndOverAPI.setActivatorEvent(event.nativeEvent);
      });

      function createHandler(type: 'DragEnd' | 'DragCancel') {
        return async function handler() {
          const {active, collisions, over, scrollAdjustedTranslate} =
            sensorContext.current;
          let event: DragEndEvent | null = null;

          if (active && scrollAdjustedTranslate) {
            const {cancelDrop} = latestProps.current;

            event = {
              activatorEvent,
              active: active,
              collisions,
              delta: scrollAdjustedTranslate,
              over,
            };

            if (type === 'DragEnd' && typeof cancelDrop === 'function') {
              const shouldCancel = await Promise.resolve(cancelDrop(event));

              if (shouldCancel) {
                type = 'DragCancel';
              }
            }
          }

          activeRef.current = null;

          unstable_batchedUpdates(() => {
            activeAndOverAPI.setActive(null);
            dispatch({type: Action.ClearCoordinates});
            setStatus(Status.Uninitialized);
            activeAndOverAPI.setOver(null);
            setActiveSensor(null);
            activeAndOverAPI.setActivatorEvent(null);

            const eventName = type === 'DragEnd' ? 'onDragEnd' : 'onDragCancel';

            if (event) {
              const handler = latestProps.current[eventName];

              handler?.(event);
              dispatchMonitorEvent({type: eventName, event});
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
      handler: SensorActivatorFunction<any>,
      sensor: SensorDescriptor<any>
    ): SyntheticListener['handler'] => {
      return (event, active) => {
        const nativeEvent = event.nativeEvent as DndEvent;
        const activeDraggableNode = draggableNodes.get(active);

        if (
          // Another sensor is already instantiating
          activeRef.current !== null ||
          // No active draggable
          !activeDraggableNode ||
          // Event has already been captured
          nativeEvent.dndKit ||
          nativeEvent.defaultPrevented
        ) {
          return;
        }

        const activationContext = {
          active: activeDraggableNode,
        };
        const shouldActivate = handler(
          event,
          sensor.options,
          activationContext
        );

        if (shouldActivate === true) {
          nativeEvent.dndKit = {
            capturedBy: sensor.sensor,
          };

          activeRef.current = active;
          instantiateSensor(event, sensor);
        }
      };
    },
    [draggableNodes, instantiateSensor]
  );

  const activators = useCombineActivators(
    sensors,
    bindActivatorToSensorInstantiator
  );

  useSensorSetup(sensors);

  useIsomorphicLayoutEffect(() => {
    if (activeNodeRect && status === Status.Initializing) {
      setStatus(Status.Initialized);
    }
  }, [activeNodeRect, status]);

  useEffect(
    () => {
      const {onDragMove} = latestProps.current;
      const {active, activatorEvent, collisions, over} = sensorContext.current;

      if (!active || !activatorEvent) {
        return;
      }

      const event: DragMoveEvent = {
        active,
        activatorEvent,
        collisions,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y,
        },
        over,
      };

      unstable_batchedUpdates(() => {
        onDragMove?.(event);
        dispatchMonitorEvent({type: 'onDragMove', event});
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]
  );

  useEffect(
    () => {
      const {
        active,
        activatorEvent,
        collisions,
        droppableContainers,
        scrollAdjustedTranslate,
      } = sensorContext.current;

      if (
        !active ||
        activeRef.current == null ||
        !activatorEvent ||
        !scrollAdjustedTranslate
      ) {
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
        activatorEvent,
        collisions,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y,
        },
        over,
      };

      unstable_batchedUpdates(() => {
        activeAndOverAPI.setOver(over);
        onDragOver?.(event);
        dispatchMonitorEvent({type: 'onDragOver', event});
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overId]
  );

  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      activatorEvent,
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
    ...autoScrollOptions,
    delta: translate,
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
      measuringConfiguration,
      measuringScheduled,
      windowRect,
      activeAndOverAPI: activeAndOverAPI,
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
    measuringConfiguration,
    measuringScheduled,
    windowRect,
    activeAndOverAPI,
  ]);

  const internalContext = useMemo(() => {
    const context: InternalContextDescriptor = {
      useMyActive: activeAndOverAPI.useMyActive,
      useGloablActive: activeAndOverAPI.useActive,
      useMyActivatorEvent: activeAndOverAPI.useMyActivatorEvent,
      useGlobalActivatorEvent: activeAndOverAPI.useActivatorEvent,
      useMyActiveNodeRect: (id: UniqueIdentifier) => {
        const domValues = useActiveNodeDomValues(
          draggableNodes,
          measuringConfiguration,
          id
        );
        return domValues?.activeNodeRect || null;
      },
      activators,
      ariaDescribedById: {
        draggable: draggableDescribedById,
      },
      dispatch,
      draggableNodes,
      useMyOverForDraggable: activeAndOverAPI.useMyOverForDraggable,
      useMyOverForDroppable: activeAndOverAPI.useMyOverForDroppable,
      measureDroppableContainers,
      isDefaultContext: false,
      useMyActiveForDroppable: activeAndOverAPI.useMyActiveForDroppable,
    };

    return context;
  }, [
    activeAndOverAPI,
    activators,
    draggableDescribedById,
    dispatch,
    draggableNodes,
    measureDroppableContainers,
    measuringConfiguration,
  ]);

  return (
    <DndMonitorContext.Provider value={registerMonitorListener}>
      <InternalContext.Provider value={internalContext}>
        <PublicContext.Provider value={publicContext}>
          <ActiveDraggableContext.Provider value={transform}>
            {children}
          </ActiveDraggableContext.Provider>
        </PublicContext.Provider>
        <RestoreFocus disabled={accessibility?.restoreFocus === false} />
      </InternalContext.Provider>
      <Accessibility
        {...accessibility}
        hiddenTextDescribedById={draggableDescribedById}
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
      isInitialized &&
      !activeSensorDisablesAutoscroll &&
      !autoScrollGloballyDisabled;

    if (typeof autoScroll === 'object') {
      return {
        ...autoScroll,
        enabled,
      };
    }

    return {enabled};
  }
});
