import React, {forwardRef, useImperativeHandle} from 'react';
import {createPortal} from 'react-dom';
import {canUseDOM, useUniqueId} from '@dnd-kit/utilities';

import {HiddenText, LiveRegion} from './components';
import {useAnnouncement} from './hooks';
import {ScreenReaderInstructions} from './types';
import {UniqueIdentifier} from '../../types';

interface Props {
  screenReaderInstructions: ScreenReaderInstructions;
  hiddenTextDescribedById: UniqueIdentifier;
}

export interface AccessibilityRef {
  announce: ReturnType<typeof useAnnouncement>['announce'];
}

export const Accessibility = forwardRef<AccessibilityRef, Props>(
  function Accessibility(props, ref) {
    const {hiddenTextDescribedById, screenReaderInstructions} = props;
    const {announce, announcements} = useAnnouncement();
    const liveRegionId = useUniqueId(`DndLiveRegion`);

    useImperativeHandle(ref, () => ({
      announce,
    }));

    return canUseDOM
      ? createPortal(
          <>
            <HiddenText
              id={hiddenTextDescribedById}
              value={screenReaderInstructions.draggable}
            />
            <LiveRegion id={liveRegionId} announcements={announcements} />
          </>,
          document.body
        )
      : null;
  }
);
