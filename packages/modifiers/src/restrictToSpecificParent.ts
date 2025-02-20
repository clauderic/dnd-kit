import type {Modifier} from '@dnd-kit/core';
import type {RefObject} from 'react';
import {restrictToBoundingRect} from './utilities';

export interface RestrictToSpecificParentOptions {
  parentRef: RefObject<HTMLElement>;
}

export const restrictToSpecificParent = (
  options: RestrictToSpecificParentOptions
): Modifier => {
  return ({transform, draggingNodeRect}) => {
    if (!draggingNodeRect || !options.parentRef.current) {
      return transform;
    }

    const parentRect = options.parentRef.current.getBoundingClientRect();
    return restrictToBoundingRect(transform, draggingNodeRect, parentRect);
  };
};