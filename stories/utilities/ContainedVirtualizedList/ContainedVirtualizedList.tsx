// Based on:
// https://github.com/clauderic/react-tiny-virtual-list
import React from 'react';

const DEFAULT_OVERSCAN = 3;
interface Props {
  className?: string;
  style?: React.CSSProperties;
  containerScrollTop: number;
  containerHeight: number;
  offsetTopInsideScrollableArea: number;
  itemCount: number;
  itemHeight: number;
  overscanCount?: number;
  renderItem(itemInfo: ContainedVirtualizedListItemInfo): React.ReactNode;
}

const STYLE_INNER: React.CSSProperties = {
  position: 'relative',
  width: '100%',
};

export const ContainedVirtualizedList = React.memo(
  function ContainedVirtualizedList(props: Props) {
    const {
      containerScrollTop,
      containerHeight,
      itemHeight,
      overscanCount = DEFAULT_OVERSCAN,
      renderItem,
      itemCount,
      offsetTopInsideScrollableArea,
    } = props;

    const fullListHeight = itemCount * itemHeight;

    const calculatedSelfScroll = Math.max(
      containerScrollTop - offsetTopInsideScrollableArea,
      0
    );

    // todo: this is an optimization that depends on more accurate offsetTopInsideScrollableArea updates
    // might require ResizeObserver to make it work properly

    const noItemsAreVisible =
      containerScrollTop > offsetTopInsideScrollableArea + fullListHeight ||
      containerScrollTop + containerHeight < offsetTopInsideScrollableArea;

    const startBeforeOverscan = Math.floor(calculatedSelfScroll / itemHeight);
    const startWithOverScan = Math.max(startBeforeOverscan - overscanCount, 0);
    const stopWithOverscan = Math.min(
      Math.ceil(containerHeight / itemHeight) +
        startBeforeOverscan +
        overscanCount,
      itemCount - 1
    );

    const items: React.ReactNode[] = [];
    const innerStyle = {
      ...STYLE_INNER,
      height: fullListHeight,
    };

    if (!noItemsAreVisible) {
      for (let index = startWithOverScan; index <= stopWithOverscan; index++) {
        items.push(
          renderItem({
            index,
            style: getSizeAndPositionForIndex(index, itemHeight),
          })
        );
      }
    }

    return <div style={innerStyle}>{items}</div>;
  }
);

function getSizeAndPositionForIndex(
  index: number,
  itemSize: number
): ContainedVirtualizedListItemStyle {
  return {
    top: index * itemSize,
    height: itemSize,
    left: 0,
    position: 'absolute',
    width: '100%',
  };
}

export interface ContainedVirtualizedListItemStyle {
  position: ContainedVirtualizedListItemPosition;
  top?: number;
  left: number;
  width: string | number;
  height?: number;
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  marginBottom?: number;
  zIndex?: number;
}

export interface ContainedVirtualizedListItemInfo {
  index: number;
  style: ContainedVirtualizedListItemStyle;
}

export type ContainedVirtualizedListItemPosition = 'absolute' | 'sticky';
