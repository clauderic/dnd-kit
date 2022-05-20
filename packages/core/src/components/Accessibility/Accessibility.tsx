import React, {useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {useUniqueId} from '@dnd-kit/utilities';
import {HiddenText, LiveRegion, useAnnouncement} from '@dnd-kit/accessibility';

import type {UniqueIdentifier} from '../../types';
import {DndMonitorListener, useDndMonitor} from '../DndMonitor';

import type {Announcements, ScreenReaderInstructions} from './types';
import {
  defaultAnnouncements,
  defaultScreenReaderInstructions,
} from './defaults';

interface Props {
  announcements?: Announcements;
  container?: Element;
  screenReaderInstructions?: ScreenReaderInstructions;
  hiddenTextDescribedById: UniqueIdentifier;
}

export function Accessibility({
  announcements = defaultAnnouncements,
  container,
  hiddenTextDescribedById,
  screenReaderInstructions = defaultScreenReaderInstructions,
}: Props) {
  const {announce, announcement} = useAnnouncement();
  const liveRegionId = useUniqueId(`DndLiveRegion`);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useDndMonitor(
    useMemo<DndMonitorListener>(
      () => ({
        onDragStart({active}) {
          announce(announcements.onDragStart(active.id));
        },
        onDragMove({active, over}) {
          if (announcements.onDragMove) {
            announce(announcements.onDragMove(active.id, over?.id));
          }
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
