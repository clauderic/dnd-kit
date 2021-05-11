import React, {useState} from 'react';
import classNames from 'classnames';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  useDraggable,
  MouseSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  restrictToParentElement,
  restrictToHorizontalAxis,
} from '@dnd-kit/modifiers';

import styles from './Code.module.css';

interface Props<T> {
  children: React.ReactNode;
  tabs?: T[];
  selected?: T;
}

interface TabProps {
  name: string;
  selected?: boolean;
  children: React.ReactNode;
}

function Tab({children}: TabProps) {
  return <>{children}</>;
}

function isTab(node: React.ReactNode): node is {props: TabProps} {
  return Boolean(
    node && typeof node === 'object' && 'type' in node && node.type === Tab
  );
}

function getTabs(children: React.ReactNode) {
  const tabs: TabProps[] = [];

  React.Children.forEach(children, (child: React.ReactNode) => {
    if (isTab(child)) {
      tabs.push(child.props);
    }
  });

  return tabs;
}

export function Code<T extends string>(props: Props<T>) {
  const tabs = getTabs(props.children);
  const selectedTab = tabs.find((tab) => tab.selected === true) ?? tabs[0];

  return (
    <Editor
      tabs={tabs.map(({name}) => name)}
      selected={selectedTab ? selectedTab.name : undefined}
      {...props}
    />
  );
}

Code.Tab = Tab;

function Editor<T extends string>({children, tabs, selected}: Props<T>) {
  const [selectedTab, setSelectedTab] = useState<T | undefined>(
    selected ?? tabs?.[0]
  );
  const [orderedTabs, setOrderedTabs] = useState(tabs);
  const {isDragging, listeners, setNodeRef, transform} = useDraggable({
    id: 'editor',
  });
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div
      ref={setNodeRef}
      className={classNames(styles.Code, isDragging && styles.dragging)}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
    >
      {orderedTabs?.length ? (
        <div className={styles.Header}>
          <div className={styles.Circles} role="presentation" {...listeners}>
            <div className={styles.Circle} />
            <div className={styles.Circle} />
            <div className={styles.Circle} />
          </div>
          <div className={styles.Tabs} role="tablist">
            <DndContext
              autoScroll={false}
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToParentElement, restrictToHorizontalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedTabs}
                strategy={horizontalListSortingStrategy}
              >
                {orderedTabs.map((tab) => (
                  <Sortable
                    key={tab}
                    id={tab}
                    selected={selectedTab === tab}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab}
                  </Sortable>
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <div className={styles.Spacer} {...listeners} />
        </div>
      ) : null}
      <div className={styles.TabContent} role="tabpanel">
        {React.Children.map(children, (child, index) => {
          return orderedTabs?.length &&
            selectedTab &&
            index === orderedTabs.indexOf(selectedTab)
            ? child
            : null;
        })}
      </div>
    </div>
  );

  function handleDragEnd({active, over}: DragEndEvent) {
    if (over) {
      setOrderedTabs((tabs) => {
        if (!tabs) {
          return;
        }

        const newIndex = tabs.indexOf(over.id as T);
        const oldIndex = tabs.indexOf(active.id as T);

        return arrayMove(tabs, oldIndex, newIndex);
      });
    }
  }
}

function Sortable({children, id, onClick, selected}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  });

  return (
    <button
      ref={setNodeRef}
      className={classNames(
        isDragging && styles.dragging,
        selected && styles.selected
      )}
      onClick={onClick}
      style={{
        position: 'relative',
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 1 : undefined,
      }}
      {...listeners}
      {...attributes}
      role="tab"
    >
      {icon}
      {children}
    </button>
  );
}

const icon = (
  <svg
    width="13"
    height="13"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 630 630"
  >
    <rect width="630" height="630" />
    <path
      fill="#000"
      d="m423.2 492.19c12.69 20.72 29.2 35.95 58.4 35.95 24.53 0 40.2-12.26 40.2-29.2 0-20.3-16.1-27.49-43.1-39.3l-14.8-6.35c-42.72-18.2-71.1-41-71.1-89.2 0-44.4 33.83-78.2 86.7-78.2 37.64 0 64.7 13.1 84.2 47.4l-46.1 29.6c-10.15-18.2-21.1-25.37-38.1-25.37-17.34 0-28.33 11-28.33 25.37 0 17.76 11 24.95 36.4 35.95l14.8 6.34c50.3 21.57 78.7 43.56 78.7 93 0 53.3-41.87 82.5-98.1 82.5-54.98 0-90.5-26.2-107.88-60.54zm-209.13 5.13c9.3 16.5 17.76 30.45 38.1 30.45 19.45 0 31.72-7.61 31.72-37.2v-201.3h59.2v202.1c0 61.3-35.94 89.2-88.4 89.2-47.4 0-74.85-24.53-88.81-54.075z"
    />
  </svg>
);
