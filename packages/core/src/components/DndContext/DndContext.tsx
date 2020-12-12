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
  useCallbackRef,
  useIsomorphicEffect,
  useNodeRef,
  useUniqueId,
} from '@dnd-kit/utilities';

import {
  Context,
  State,
  DndContextDescriptor,
  Action,
  initialState,
  reducer,
} from '../../store';
import type {
  Coordinates,
  PositionalClientRect,
  ScrollCoordinates,
  Translate,
} from '../../types';
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

export interface DragStartEvent {
  active: NonNullable<Active>;
}

export interface DragMoveEvent {
  active: NonNullable<Active>;
  delta: Translate;
  draggingRect: PositionalClientRect;
  droppableClientRects: PositionalClientRectMap;
  over: {
    id: UniqueIdentifier;
    clientRect: PositionalClientRect;
  } | null;
}

export interface DragOverEvent {
  active: NonNullable<Active>;
  draggingRect: PositionalClientRect;
  droppableClientRects: PositionalClientRectMap;
  over: {
    id: UniqueIdentifier;
    clientRect: PositionalClientRect;
  } | null;
}

export interface DragEndEvent {
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
  onDragCancel?(): void;
}

type Active = State['draggable']['active'];

export type SensorContext = {
  activeRect: PositionalClientRect | null;
  containerScroll: ScrollCoordinates;
  droppableClientRects: PositionalClientRectMap;
  droppableContainers: DroppableContainers;
  over: {
    id: string;
  } | null;
  scrollingContainer: Element | null;
  windowScroll: ScrollCoordinates;
};

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
  const activeRef = useRef<Active>(null);
  const [activeSensor, setActiveSensor] = useState<SensorInstance | null>(null);
  const [activatorEvent, setActivatorEvent] = useState<Event | null>(null);
  const latestProps = useRef(props);
  const draggableDescribedById = useUniqueId(`DndDescribedBy`);

  const {
    clientRects: droppableClientRects,
    recomputeClientRects,
    willRecomputeClientRects,
  } = useClientRects(droppableContainers, activeRef.current === null);

  const activeNode = active?.node.current || null;
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
    active && document.scrollingElement
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

  const instantiateSensor = useCallbackRef(
    (
      event: React.SyntheticEvent,
      {sensor: Sensor, options}: SensorDescriptor<any>
    ) => {
      if (!activeRef.current) {
        return;
      }

      const sensorInstance = new Sensor({
        active: activeRef.current,
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
            onDragStart({active: activeRef.current});
          }
        },
        onMove(coordinates) {
          dispatch({
            type: Action.DragMove,
            coordinates,
          });
        },
        onEnd() {
          const {onDragEnd} = latestProps.current;
          const {overId, windowScrollAdjustedTranslate} = tracked.current;

          if (activeRef.current) {
            activeRef.current = null;
          }

          dispatch({
            type: Action.DragEnd,
          });
          setActiveSensor(null);
          setActivatorEvent(null);

          if (onDragEnd) {
            onDragEnd({
              delta: windowScrollAdjustedTranslate,
              over: overId
                ? {
                    id: overId,
                  }
                : null,
            });
          }
        },
        onCancel() {
          const {onDragCancel} = latestProps.current;

          if (activeRef.current) {
            activeRef.current = null;
          }

          dispatch({
            type: Action.DragCancel,
          });
          setActiveSensor(null);
          setActivatorEvent(null);

          if (onDragCancel) {
            onDragCancel();
          }
        },
      });

      setActiveSensor(sensorInstance);
      setActivatorEvent(event.nativeEvent);
    }
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

          if (active.node.current == null) {
            throw new Error('Active node is null');
          }

          // TODO: This should not be needed
          activeRef.current = active as NonNullable<Active>;
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
    if (!activeRef.current) {
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
      active: activeRef.current,
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
    if (!activeRef.current) {
      return;
    }

    const {onDragOver} = latestProps.current;
    const {translateAdjustedClientRect} = tracked.current;

    if (!translateAdjustedClientRect || !tracked.current.droppableClientRects) {
      return;
    }

    if (onDragOver) {
      onDragOver({
        active: activeRef.current,
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
      activeRect: activeNodeRect,
      activatorEvent,
      activators,
      ariaDescribedById: {
        draggable: draggableDescribedById,
      },
      droppableClientRects,
      cloneNode: {
        nodeRef: cloneNodeRef,
        clientRect: cloneNodeClientRect,
        setRef: setCloneNodeRef,
      },
      dispatch,
      draggableNodes,
      droppableContainers,
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
        activeId={active?.id ?? null}
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
