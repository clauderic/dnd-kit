import React, {useState} from 'react';
import type {CancelDrop, UniqueIdentifier} from '@dnd-kit/core';
import {rectSortingStrategy} from '@dnd-kit/sortable';

import {MultipleContainers, TRASH_ID} from './MultipleContainers';

import {ConfirmModal} from '../../components';
import {MultipleContainersWithPlaceholders} from './MultipleContainersWithPlaceholders';

export default {
  title: 'Presets/Sortable/Multiple Containers',
};

export const BasicSetup = () => <MultipleContainers />;

export const DragHandle = () => <MultipleContainers handle />;

export const ManyItems = () => (
  <MultipleContainers
    containerStyle={{
      maxHeight: '80vh',
    }}
    itemCount={15}
    scrollable
  />
);

export const Vertical = () => <MultipleContainers itemCount={5} vertical />;

export const DynamicPlaceholder = () => {
  const [customDragOverlayHeight, setCustomDragOverlayHeight] = useState(50);
  const [activatePlaceholder, setActivatePlaceholder] = useState(true);
  const [
    activateCustomDragOverlayHeight,
    setActivateCustomDragOverlayHeight,
  ] = useState(false);
  const [trackDragOverlayHeight, setTrackDragOverlayHeight] = useState(false);
  const props = {
    placeholder: activatePlaceholder,
    customDragOverlayHeight,
    activateCustomDragOverlayHeight,
    trackDragOverlayHeight,
  };
  return (
    <>
      <MultipleContainersWithPlaceholders {...props} />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3>Features</h3>
        <label>
          <input
            type="checkbox"
            checked={activatePlaceholder}
            onChange={(event) => setActivatePlaceholder(event?.target.checked)}
          />
          Activate Placeholder
        </label>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <label>
            <input
              type="checkbox"
              value="closestCenter"
              checked={activateCustomDragOverlayHeight}
              onChange={(event) =>
                setActivateCustomDragOverlayHeight(event?.target.checked)
              }
            />
            UseCustom DragOverlay Height
          </label>
          <label style={{marginLeft: '1rem'}}>
            <input
              type="number"
              value={customDragOverlayHeight}
              onChange={(event) =>
                setCustomDragOverlayHeight(parseInt(event.target.value))
              }
            />
          </label>
        </div>
        <label>
          <input
            type="checkbox"
            checked={trackDragOverlayHeight}
            onChange={(event) =>
              setTrackDragOverlayHeight(event?.target.checked)
            }
          />
          Track DragOverlay height on Placeholder
        </label>
      </div>
    </>
  );
};

export const TrashableItems = ({confirmDrop}: {confirmDrop: boolean}) => {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const resolveRef = React.useRef<(value: boolean) => void>();

  const cancelDrop: CancelDrop = async ({active, over}) => {
    if (over?.id !== TRASH_ID) {
      return true;
    }

    setActiveId(active.id);

    const confirmed = await new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });

    setActiveId(null);

    return confirmed === false;
  };

  return (
    <>
      <MultipleContainers
        cancelDrop={confirmDrop ? cancelDrop : undefined}
        trashable
      />
      {activeId && (
        <ConfirmModal
          onConfirm={() => resolveRef.current?.(true)}
          onDeny={() => resolveRef.current?.(false)}
        >
          Are you sure you want to delete "{activeId}"?
        </ConfirmModal>
      )}
    </>
  );
};

TrashableItems.argTypes = {
  confirmDrop: {
    name: 'Request user confirmation before deletion',
    defaultValue: false,
    control: {type: 'boolean'},
  },
};

export const Grid = () => (
  <MultipleContainers
    columns={2}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
  />
);

export const VerticalGrid = () => (
  <MultipleContainers
    columns={2}
    itemCount={5}
    strategy={rectSortingStrategy}
    wrapperStyle={() => ({
      width: 150,
      height: 150,
    })}
    vertical
  />
);
