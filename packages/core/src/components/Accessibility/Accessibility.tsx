import React, {useMemo} from 'react';
import {createPortal} from 'react-dom';
import {canUseDOM, useUniqueId} from '@dnd-kit/utilities';
import {HiddenText, LiveRegion, useAnnouncement} from '@dnd-kit/accessibility';

import type {Announcements, ScreenReaderInstructions} from './types';
import type {UniqueIdentifier} from '../../types';
import {defaultAnnouncements} from './defaults';
import {DndMonitorArguments, useDndMonitor} from '../../hooks';

interface Props {
  announcements?: Announcements;
  screenReaderInstructions: ScreenReaderInstructions;
  hiddenTextDescribedById: UniqueIdentifier;
}

export function Accessibility({
  announcements = defaultAnnouncements,
  hiddenTextDescribedById,
  screenReaderInstructions,
}: Props) {
  const {announce, announcement} = useAnnouncement();
  const liveRegionId = useUniqueId(`DndLiveRegion`);

  useDndMonitor(
    useMemo<DndMonitorArguments>(
      () => ({
        onDragStart({active}) {
          announce(announcements.onDragStart(active.id));
        },
        onDragOver({active, over}) {
          announce(announcements.onDragOver(active.id, over?.id));
        },
        onDragEnd({active, over}) {
          announce(announcements.onDragEnd(active.id, over?.id));
        },
        onDragCancel({active}) {
          announce(announcements.onDragCancel(active.id));
        },
      }),
      [announce, announcements]
    )
  );

  return canUseDOM
    ? createPortal(
        <>
          <HiddenText
            id={hiddenTextDescribedById}
            value={screenReaderInstructions.draggable}
          />
          <LiveRegion id={liveRegionId} announcement={announcement} />
        </>,
        document.body
      )
    : null;
}
