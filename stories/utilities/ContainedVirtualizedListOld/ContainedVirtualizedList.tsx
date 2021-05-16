// Based on:
// https://github.com/clauderic/react-tiny-virtual-list

import * as React from 'react';
import {DIRECTION, positionProp, sizeProp} from './constants';
import type {ItemInfo, ItemStyle} from './main';
import type {ItemSizeGetter} from './SizeAndPositionManager';
import {SizeAndPositionManager} from './SizeAndPositionManager';

export interface Props {
  className?: string;
  style?: React.CSSProperties;
  containerScrollTop: number;
  containerViewportHeight: number;
  itemCount: number;
  itemSizeGetter: ItemSizeGetter;
  estimatedItemSize: number;
  overscanCount?: number;
  renderItem(itemInfo: ItemInfo): React.ReactNode;
}

interface StyleCache {
  [id: number]: ItemStyle;
}

const STYLE_INNER: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: '100%',
};

const STYLE_ITEM: {
  position: ItemStyle['position'];
  top: ItemStyle['top'];
  left: ItemStyle['left'];
  width: ItemStyle['width'];
} = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
};

export function ContainedVirtualizedList(props: Props) {
  const {
    containerScrollTop,
    containerViewportHeight,
    estimatedItemSize,
    overscanCount = 3,
    renderItem,
    itemCount,
    itemSizeGetter,
  } = props;

  const styleCache = React.useRef<StyleCache>({});

  const [sizeAndPositionManager] = React.useState(() => {
    return new SizeAndPositionManager({
      itemCount,
      itemSizeGetter,
      estimatedItemSize,
    });
  });

  React.useEffect(() => {
    sizeAndPositionManager.updateConfig({
      itemCount,
      itemSizeGetter,
      estimatedItemSize,
    });
  }, [estimatedItemSize, itemCount, itemSizeGetter, sizeAndPositionManager]);

  const [
    listContainerElement,
    setListContainerElement,
  ] = React.useState<HTMLDivElement | null>(null);
  const [
    listStartPositionInParent,
    setListStartPositionInParent,
  ] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    if (!listContainerElement) {
      return;
    }

    setListStartPositionInParent(listContainerElement.offsetTop);
    // listContainerElement.offsetTop is indirectly depends on containerScrollTop,
    // when something other than the current list changes it's size,
    // current list offsetTop possible changes, and we need to react to that
    containerScrollTop.toString();
  }, [containerScrollTop, listContainerElement]);

  const calculatedSelfScroll = Math.max(
    listStartPositionInParent
      ? containerScrollTop - listStartPositionInParent
      : 0,
    // make sure not negative
    0
  );

  const {start, stop} = sizeAndPositionManager.getVisibleRange({
    containerSize: containerViewportHeight,
    offset: calculatedSelfScroll,
    overscanCount,
  });
  const items: React.ReactNode[] = [];
  const innerStyle = {
    ...STYLE_INNER,
    [sizeProp[DIRECTION.VERTICAL]]: sizeAndPositionManager.getTotalSize(),
  };
  if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
    for (let index = start; index <= stop; index++) {
      items.push(
        renderItem({
          index,
          style: getStyle(index, styleCache.current, sizeAndPositionManager),
        })
      );
    }
  }

  return (
    <div style={innerStyle} ref={setListContainerElement}>
      {items}
    </div>
  );
}

function getStyle(
  index: number,
  styleCache: StyleCache,
  sizeAndPositionManager: SizeAndPositionManager
) {
  const style = styleCache[index];

  if (style) {
    return style;
  }

  const {size, offset} = sizeAndPositionManager.getSizeAndPositionForIndex(
    index
  );

  return (styleCache[index] = {
    ...STYLE_ITEM,
    [sizeProp[DIRECTION.VERTICAL]]: size,
    [positionProp[DIRECTION.VERTICAL]]: offset,
  });
}
