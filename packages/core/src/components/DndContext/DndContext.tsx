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
  DraggableContextType,
  Events,
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
import {useDrag} from '../../hooks/core/useDrag';
import {
  SensorInstance,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  SensorDescriptor,
  SensorHandler,
} from '../../sensors';
import {
  CollisionDetection,
  defaultCoordinates,
  getAdjustedClientRect,
  isDocumentScrollingElement,
  noop,
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
  AccessibilityRef,
  Announcements,
  announcements as defaultAnnouncements,
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
  clientRects: PositionalClientRectMap;
  over: {
    id: UniqueIdentifier;
    clientRect: PositionalClientRect;
  } | null;
}

export interface DragOverEvent {
  active: NonNullable<Active>;
  draggingRect: PositionalClientRect;
  clientRects: PositionalClientRectMap;
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

type Active = Parameters<typeof reducer>[0]['active'];

export type SensorContext = {
  activeRect: PositionalClientRect | null;
  clientRects: PositionalClientRectMap;
  scrollingContainer: Element | null;
  containerScroll: ScrollCoordinates;
  windowScroll: ScrollCoordinates;
  droppableContainers: DroppableContainers;
  over: {
    id: string;
  } | null;
};

const defaultSensors = [
  {sensor: KeyboardSensor, options: {}},
  {sensor: MouseSensor, options: {}},
  {sensor: TouchSensor, options: {}},
];

export const ActiveDraggableContext = createContext<Transform>({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1,
});

export const DndContext = memo(function DndContext({
  autoScroll = true,
  children,
  sensors = defaultSensors,
  collisionDetection = rectIntersection,
  screenReaderInstructions = defaultScreenReaderInstructions,
  translateModifiers,
  ...props
}: Props) {
  const store = useReducer(reducer, initialState);
  const [state, dispatch] = store;
  const {active, droppableContainers} = state;
  const activeRef = useRef<Active>(null);
  const [activeSensor, setActiveSensor] = useState<SensorInstance | null>(null);
  const [activatorEvent, setActivatorEvent] = useState<Event | null>(null);
  const latestProps = useRef(props);
  const draggableDescribedById = useUniqueId(`DndDescribedBy`);
  const accessibilityRef = useRef<AccessibilityRef>({
    announce: noop,
  });

  useIsomorphicEffect(
    () => {
      latestProps.current = props;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(props)
  );

  const {
    clientRects,
    recomputeClientRects,
    willRecomputeClientRects,
  } = useClientRects(droppableContainers, activeRef.current === null);

  const activeNode = active?.node.current || null;
  const activeNodeRect = useClientRect(activeNode);
  const tracked = useRef<{
    clientRects: PositionalClientRectMap | null;
    overId: UniqueIdentifier | null;
    windowScrollAdjustedTranslate: Coordinates;
    translateAdjustedClientRect: PositionalClientRect | null;
  }>({
    clientRects: null,
    overId: null,
    windowScrollAdjustedTranslate: defaultCoordinates,
    translateAdjustedClientRect: null,
  });
  const trackedId = tracked.current.overId;
  const overNode =
    trackedId && droppableContainers[trackedId]
      ? droppableContainers[trackedId].node.current
      : null;
  const scrollingContainer = useScrollingParent(overNode);
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
  const draggingRect = cloneNodeClientRect || activeNodeRect;
  const {
    handlers: {onStart, onMove, onEnd},
    state: {translate},
  } = useDrag();

  const sensorContext = useRef<SensorContext>({
    activeRect: draggingRect,
    clientRects,
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
    : clientRects && finalAdjustedClientRect
    ? collisionDetection(
        Array.from(clientRects.entries()),
        finalAdjustedClientRect
      )
    : null;

  console.log(overId);

  const overRect = overId ? clientRects.get(overId) : null;
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

  const transform = {
    ...modifiedTranslate,
    scaleX:
      overRect && activeNodeRect ? overRect.width / activeNodeRect.width : 1,
    scaleY:
      overRect && activeNodeRect ? overRect.height / activeNodeRect.height : 1,
  };

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

        onStart: (initialCoordinates: Coordinates) => {
          if (!activeRef.current) {
            return;
          }

          const {
            announcements = defaultAnnouncements,
            onDragStart,
          } = latestProps.current;

          onStart(initialCoordinates);
          dispatch({
            type: Events.SetActiveElement,
            ...activeRef.current,
          });

          const announcement = announcements.onDragStart(activeRef.current.id);

          if (announcement) {
            accessibilityRef.current.announce(announcement);
          }

          if (onDragStart) {
            onDragStart({active: activeRef.current});
          }
        },
        onMove,
        onEnd() {
          const {
            announcements = defaultAnnouncements,
            onDragEnd,
          } = latestProps.current;
          const {overId, windowScrollAdjustedTranslate} = tracked.current;

          if (activeRef.current) {
            const announcement = announcements.onDragEnd(
              activeRef.current.id,
              overId ?? undefined
            );

            if (announcement) {
              accessibilityRef.current.announce(announcement);
            }

            activeRef.current = null;
          }

          dispatch({
            type: Events.UnsetActiveElement,
          });
          setActiveSensor(null);
          setActivatorEvent(null);

          onEnd();

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
          const {
            announcements = defaultAnnouncements,
            onDragCancel,
          } = latestProps.current;

          if (activeRef.current) {
            const announcement = announcements.onDragCancel(
              activeRef.current.id
            );

            if (announcement) {
              accessibilityRef.current.announce(announcement);
            }

            activeRef.current = null;
          }

          dispatch({
            type: Events.UnsetActiveElement,
          });
          setActiveSensor(null);
          setActivatorEvent(null);
          onEnd();

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
        if (activeRef.current !== null) {
          return;
        }

        if (handler(event, sensor.options) === true) {
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
    const {overId, clientRects, translateAdjustedClientRect} = tracked.current;

    if (!onDragMove || !clientRects || !translateAdjustedClientRect) {
      return;
    }
    const overRect = overId ? clientRects.get(overId) : null;

    onDragMove({
      active: activeRef.current,
      draggingRect: translateAdjustedClientRect,
      clientRects,
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

    const {
      announcements = defaultAnnouncements,
      onDragOver,
    } = latestProps.current;
    const {translateAdjustedClientRect} = tracked.current;

    if (!translateAdjustedClientRect || !tracked.current.clientRects) {
      return;
    }

    const announcement = announcements.onDragOver(
      activeRef.current.id,
      over?.id
    );

    if (announcement) {
      accessibilityRef.current.announce(announcement);
    }

    if (onDragOver) {
      onDragOver({
        active: activeRef.current,
        clientRects: tracked.current.clientRects,
        draggingRect: translateAdjustedClientRect,
        over,
      });
    }
  }, [over]);

  useIsomorphicEffect(() => {
    tracked.current = {
      clientRects,
      overId,
      windowScrollAdjustedTranslate,
      translateAdjustedClientRect,
    };
  }, [
    clientRects,
    overId,
    windowScrollAdjustedTranslate,
    translateAdjustedClientRect,
  ]);

  useIsomorphicEffect(() => {
    sensorContext.current = {
      activeRect: draggingRect,
      clientRects,
      droppableContainers,
      scrollingContainer,
      windowScroll,
      containerScroll,
      over,
    };
  }, [
    clientRects,
    draggingRect,
    droppableContainers,
    scrollingContainer,
    windowScroll,
    containerScroll,
    over,
  ]);

  const contextValue = useMemo(() => {
    const memoizedContext: DraggableContextType = {
      active,
      activeRect: activeNodeRect,
      activatorEvent,
      activators,
      ariaDescribedById: {
        draggable: draggableDescribedById,
      },
      clientRects,
      cloneNode: {
        nodeRef: cloneNodeRef,
        clientRect: cloneNodeClientRect,
        setRef: setCloneNodeRef,
      },
      dispatch,
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
    clientRects,
    cloneNodeClientRect,
    cloneNodeRef,
    dispatch,
    draggableDescribedById,
    droppableContainers,
    over,
    recomputeClientRects,
    scrollingContainerRect,
    setCloneNodeRef,
    willRecomputeClientRects,
  ]);

  useAutoScroller({
    scrollingContainer,
    adjustedClientRect: translateAdjustedClientRect,
    disabled: !autoScroll || !activeSensor?.autoScrollEnabled,
  });

  return (
    <>
      <Context.Provider value={contextValue}>
        <ActiveDraggableContext.Provider value={transform}>
          {children}
        </ActiveDraggableContext.Provider>
      </Context.Provider>
      <Accessibility
        ref={accessibilityRef}
        hiddenTextDescribedById={draggableDescribedById}
        screenReaderInstructions={screenReaderInstructions}
      />
    </>
  );
});
