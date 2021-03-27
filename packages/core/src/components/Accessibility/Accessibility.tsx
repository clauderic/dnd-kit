import React, {useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {canUseDOM, useUniqueId} from '@dnd-kit/utilities';
import {HiddenText, LiveRegion, useAnnouncement} from '@dnd-kit/accessibility';

import type {Announcements, ScreenReaderInstructions} from './types';
import type {UniqueIdentifier} from '../../types';
import {defaultAnnouncements} from './defaults';
import {Action, State} from '../../store';

interface Props {
  announcements?: Announcements;
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  lastEvent: State['draggable']['lastEvent'];
  screenReaderInstructions: ScreenReaderInstructions;
  hiddenTextDescribedById: UniqueIdentifier;
}

export function Accessibility({
  announcements = defaultAnnouncements,
  activeId,
  overId,
  lastEvent,
  hiddenTextDescribedById,
  screenReaderInstructions,
}: Props) {
  const {announce, entries} = useAnnouncement();
  const tracked = useRef({
    activeId,
    overId,
  });
  const liveRegionId = useUniqueId(`DndLiveRegion`);

  useEffect(() => {
    const {
      activeId: previousActiveId,
      overId: previousOverId,
    } = tracked.current;
    let announcement: string | undefined;

    if (!previousActiveId && activeId) {
      announcement = announcements.onDragStart(activeId);
    } else if (!activeId && previousActiveId) {
      if (lastEvent === Action.DragEnd) {
        announcement = announcements.onDragEnd(
          previousActiveId,
          previousOverId ?? undefined
        );
      } else if (lastEvent === Action.DragCancel) {
        announcement = announcements.onDragCancel(previousActiveId);
      }
    } else if (activeId && previousActiveId && overId !== previousOverId) {
      announcement = announcements.onDragOver(activeId, overId ?? undefined);
    }

    if (announcement) {
      announce(announcement);
    }

    if (
      tracked.current.overId !== overId ||
      tracked.current.activeId !== activeId
    ) {
      tracked.current = {
        activeId,
        overId,
      };
    }
  }, [announcements, announce, activeId, overId, lastEvent]);

  return canUseDOM
    ? createPortal(
        <>
          <HiddenText
            id={hiddenTextDescribedById}
            value={screenReaderInstructions.draggable}
          />
          <LiveRegion id={liveRegionId} entries={entries} />
        </>,
        document.body
      )
    : null;
}
