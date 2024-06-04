import React, {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {useUniqueId} from '@dnd-kit/utilities';
import {HiddenText, LiveRegion, useAnnouncement} from '@dnd-kit/accessibility';

import {DndMonitorListener, useDndMonitor} from '../DndMonitor';

import type {Announcements, ScreenReaderInstructions} from './types';
import {
  defaultAnnouncements,
  defaultScreenReaderInstructions,
} from './defaults';

interface Props<DraggableData, DroppableData> {
  announcements?: Announcements<DraggableData, DroppableData>;
  container?: Element;
  screenReaderInstructions?: ScreenReaderInstructions;
  hiddenTextDescribedById: string;
}

export function Accessibility<DraggableData, DroppableData>({
  announcements = defaultAnnouncements as Announcements<
    DraggableData,
    DroppableData
  >,
  container,
  hiddenTextDescribedById,
  screenReaderInstructions = defaultScreenReaderInstructions,
}: Props<DraggableData, DroppableData>) {
  const {announce, announcement} = useAnnouncement();
  const liveRegionId = useUniqueId(`DndLiveRegion`);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useDndMonitor(
    useMemo<DndMonitorListener<DraggableData, DroppableData>>(
      () => ({
        onDragStart({active}) {
          announce(announcements.onDragStart({active}));
        },
        onDragMove({active, over}) {
          if (announcements.onDragMove) {
            announce(announcements.onDragMove({active, over}));
          }
        },
        onDragOver({active, over}) {
          announce(announcements.onDragOver({active, over}));
        },
        onDragEnd({active, over}) {
          announce(announcements.onDragEnd({active, over}));
        },
        onDragCancel({active, over}) {
          announce(announcements.onDragCancel({active, over}));
        },
      }),
      [announce, announcements]
    )
  );

  if (!mounted) {
    return null;
  }

  const markup = (
    <>
      <HiddenText
        id={hiddenTextDescribedById}
        value={screenReaderInstructions.draggable}
      />
      <LiveRegion id={liveRegionId} announcement={announcement} />
    </>
  );

  return container ? createPortal(markup, container) : markup;
}
