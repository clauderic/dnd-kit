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
  add as getAdjustedCoordinates,
  Transform,
  useIsomorphicEffect,
  useNodeRef,
  useUniqueId,
} from '@dnd-kit/utilities';

import {
  Context,
  DndContextDescriptor,
  Action,
  initialState,
  reducer,
} from '../../store';
import type {Coordinates, PositionalClientRect, Translate} from '../../types';
import {
  useAutoScroller,
  useClientRect,
  useClientRects,
  useCombineActivators,
  useScrollingParent,
  useScrollCoordinates,
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
  getAdjustedClientRect,
  isDocumentScrollingElement,
  rectIntersection,
} from '../../utilities';
import {applyModifiers, Modifiers} from '../../modifiers';
import type {
  PositionalClientRectMap,
  DroppableContainers,
} from '../../store/types';
import {UniqueIdentifier} from '../../types';
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
  draggingRect: PositionalClientRect;
  droppableClientRects: PositionalClientRectMap;
  over: {
    id: UniqueIdentifier;
    clientRect: PositionalClientRect;
  } | null;
}

export interface DragOverEvent {
  active: Active;
  draggingRect: PositionalClientRect;
  droppableClientRects: PositionalClientRectMap;
  over: {
    id: UniqueIdentifier;
    clientRect: PositionalClientRect;
  } | null;
}

export interface DragEndEvent {
  active: Active;
  delta: Translate;
  over: {
    id: UniqueIdentifier;
  } | null;
}

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
  translateModifiers?: Modifiers;
  onDragStart?(event: DragStartEvent): void;
  onDragMove?(event: DragMoveEvent): void;
  onDragOver?(event: DragOverEvent): void;
  onDragEnd?(event: DragEndEvent): void;
  onDragCancel?(event: DragEndEvent): void;
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
  translateModifiers,
  ...props
}: Props) {
  const store = useReducer(reducer, initialState);
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
    clientRects: droppableClientRects,
    recomputeClientRects,
    willRecomputeClientRects,
  } = useClientRects(droppableContainers, activeRef.current === null);

  const activeNode = useMemo(
    () => (active ? draggableNodes[active]?.current ?? null : null),
    [active, draggableNodes]
  );
  const activeNodeRect = useClientRect(activeNode);
  const tracked = useRef<{
    droppableClientRects: PositionalClientRectMap | null;
    overId: UniqueIdentifier | null;
    windowScrollAdjustedTranslate: Coordinates;
    translateAdjustedClientRect: PositionalClientRect | null;
  }>({
    droppableClientRects,
    overId: null,
    windowScrollAdjustedTranslate: defaultCoordinates,
    translateAdjustedClientRect: null,
  });
  const overNode = getNode(tracked.current.overId, droppableContainers);
  const scrollingContainer = useScrollingParent(overNode ?? activeNode);
  const scrollingContainerRect = useClientRect(scrollingContainer);
  const scrollingElementIsDocument = isDocumentScrollingElement(
    scrollingContainer
  );
  const containerScroll = useScrollCoordinates(
    // If the container is the document.scrollingElement, we don't
    // need to calculate the container scrollDelta since it will be
    // the same as the windowScrollDelta
    scrollingElementIsDocument ? null : scrollingContainer
  );
  const windowScroll = useScrollCoordinates(
    active ? document.scrollingElement : null
  );

  const [cloneNodeRef, setCloneNodeRef] = useNodeRef();
  const cloneNodeClientRect = useClientRect(cloneNodeRef.current);
  const draggingRect = cloneNodeClientRect ?? activeNodeRect;

  const sensorContext = useRef<SensorContext>({
    activeRect: draggingRect,
    droppableClientRects,
    droppableContainers,
    scrollingContainer,
    windowScroll,
    containerScroll,
    over: null,
  });

  const modifiedTranslate = applyModifiers(translateModifiers, {
    transform: {
      ...translate,
      scaleX: 1,
      scaleY: 1,
    },
    activeRect: draggingRect,
    scrollingContainerRect: scrollingContainerRect,
  });

  const windowScrollAdjustedTranslate = getAdjustedCoordinates(
    modifiedTranslate,
    windowScroll.delta
  );

  // We manually adjust the ClientRect rather than calling `getBoundingClientRect`
  // again, since that would quickly become very expensive.
  const translateAdjustedClientRect = activeNodeRect
    ? getAdjustedClientRect(activeNodeRect, modifiedTranslate)
    : null;

  // We also need to account for the scroll of the container
  const containerScrollAdjustment =
    scrollingContainer && !scrollingElementIsDocument
      ? containerScroll.current
      : defaultCoordinates;

  const containerScrollAdjustedClientRect = translateAdjustedClientRect
    ? getAdjustedClientRect(
        translateAdjustedClientRect,
        containerScrollAdjustment
      )
    : null;

  // The final adjusted client rect is a combination of the container scroll and the window scroll
  // In the case where the container is the document.scrollingElement, the containerScrollDelta is
  // always zero.
  const finalAdjustedClientRect = containerScrollAdjustedClientRect
    ? getAdjustedClientRect(
        containerScrollAdjustedClientRect,
        windowScroll.current
      )
    : null;

  const overId = willRecomputeClientRects
    ? tracked.current.overId
    : droppableClientRects && finalAdjustedClientRect
    ? collisionDetection(
        Array.from(droppableClientRects.entries()),
        finalAdjustedClientRect
      )
    : null;

  const overRect = getClientRect(overId, droppableClientRects);
  const over = useMemo(
    () =>
      overId && overRect
        ? {
            id: overId,
            clientRect: overRect,
          }
        : null,
    [overId, overRect]
  );

  const transform = adjustScale(modifiedTranslate, overRect, activeNodeRect);

  useIsomorphicEffect(
    () => {
      latestProps.current = props;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(props)
  );

  const instantiateSensor = useCallback(
    (
      event: React.SyntheticEvent,
      {sensor: Sensor, options}: SensorDescriptor<any>
    ) => {
      if (!activeRef.current) {
        return;
      }

      const sensorInstance = new Sensor({
        active: activeRef.current,
        activeNode: draggableNodes[activeRef.current],
        event: event.nativeEvent,
        options,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: sensorContext,
        onStart: (initialCoordinates) => {
          if (!activeRef.current) {
            return;
          }

          const {onDragStart} = latestProps.current;

          dispatch({
            type: Action.DragStart,
            initialCoordinates,
            active: activeRef.current,
          });

          if (onDragStart) {
            onDragStart({active: {id: activeRef.current}});
          }
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
          const {overId, windowScrollAdjustedTranslate} = tracked.current;
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

          if (handler && activeId) {
            handler({
              active: {
                id: activeId,
              },
              delta: windowScrollAdjustedTranslate,
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

        if (activeRef.current !== null || nativeEvent.dndKit) {
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

  useIsomorphicEffect(() => {
    if (!active) {
      return;
    }

    // Recompute client-rects right after dragging has begun in case they have changed
    recomputeClientRects();
  }, [active, recomputeClientRects]);

  useEffect(() => {
    const activeId = activeRef.current;

    if (!activeId) {
      return;
    }

    const {onDragMove} = latestProps.current;
    const {
      overId,
      droppableClientRects,
      translateAdjustedClientRect,
    } = tracked.current;

    if (!onDragMove || !droppableClientRects || !translateAdjustedClientRect) {
      return;
    }
    const overRect = getClientRect(overId, droppableClientRects);

    onDragMove({
      active: {
        id: activeId,
      },
      draggingRect: translateAdjustedClientRect,
      droppableClientRects,
      delta: {
        x: windowScrollAdjustedTranslate.x,
        y: windowScrollAdjustedTranslate.y,
      },
      over:
        overId && overRect
          ? {
              id: overId,
              clientRect: overRect,
            }
          : null,
    });
  }, [windowScrollAdjustedTranslate.x, windowScrollAdjustedTranslate.y]);

  useEffect(() => {
    const activeId = activeRef.current;

    if (!activeId) {
      return;
    }

    const {onDragOver} = latestProps.current;
    const {translateAdjustedClientRect} = tracked.current;

    if (!translateAdjustedClientRect || !tracked.current.droppableClientRects) {
      return;
    }

    if (onDragOver) {
      onDragOver({
        active: {
          id: activeId,
        },
        droppableClientRects: tracked.current.droppableClientRects,
        draggingRect: translateAdjustedClientRect,
        over,
      });
    }
  }, [over]);

  useIsomorphicEffect(() => {
    tracked.current = {
      droppableClientRects,
      overId,
      windowScrollAdjustedTranslate,
      translateAdjustedClientRect,
    };
  }, [
    droppableClientRects,
    overId,
    windowScrollAdjustedTranslate,
    translateAdjustedClientRect,
  ]);

  useIsomorphicEffect(() => {
    sensorContext.current = {
      activeRect: draggingRect,
      droppableClientRects,
      droppableContainers,
      scrollingContainer,
      windowScroll,
      containerScroll,
      over,
    };
  }, [
    droppableClientRects,
    draggingRect,
    droppableContainers,
    scrollingContainer,
    windowScroll,
    containerScroll,
    over,
  ]);

  useAutoScroller({
    scrollingContainer,
    adjustedClientRect: translateAdjustedClientRect,
    disabled: !autoScroll || !activeSensor?.autoScrollEnabled,
  });

  const contextValue = useMemo(() => {
    const memoizedContext: DndContextDescriptor = {
      active,
      activeNode: active ? draggableNodes[active] : null,
      activeRect: activeNodeRect,
      activatorEvent,
      activators,
      ariaDescribedById: {
        draggable: draggableDescribedById,
      },
      cloneNode: {
        nodeRef: cloneNodeRef,
        clientRect: cloneNodeClientRect,
        setRef: setCloneNodeRef,
      },
      dispatch,
      draggableNodes,
      droppableContainers,
      droppableClientRects,
      over,
      recomputeClientRects,
      scrollingContainerRect,
      willRecomputeClientRects,
    };

    return memoizedContext;
  }, [
    active,
    activeNodeRect,
    activatorEvent,
    activators,
    cloneNodeClientRect,
    cloneNodeRef,
    dispatch,
    draggableNodes,
    draggableDescribedById,
    droppableContainers,
    droppableClientRects,
    over,
    recomputeClientRects,
    scrollingContainerRect,
    setCloneNodeRef,
    willRecomputeClientRects,
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

function getNode(
  id: UniqueIdentifier | null,
  droppableContainers: DroppableContainers
): HTMLElement | null {
  return id ? droppableContainers[id]?.node.current : null;
}

function getClientRect(
  id: UniqueIdentifier | null,
  clientRects: PositionalClientRectMap
): PositionalClientRect | null {
  return id ? clientRects.get(id) ?? null : null;
}
