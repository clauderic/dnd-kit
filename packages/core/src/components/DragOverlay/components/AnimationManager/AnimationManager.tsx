import React, {cloneElement, useState} from 'react';
import {useIsomorphicLayoutEffect, usePrevious} from '@dnd-kit/utilities';

export type Animation = (
  key: string,
  node: HTMLElement
) => Promise<void> | void;

export interface Props {
  animation: Animation;
  children: React.ReactElement | null;
}

export function AnimationManager({animation, children}: Props) {
  const [
    clonedChildren,
    setClonedChildren,
  ] = useState<React.ReactElement | null>(null);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const previousChildren = usePrevious(children);

  if (!children && !clonedChildren && previousChildren) {
    setClonedChildren(previousChildren);
  }

  useIsomorphicLayoutEffect(() => {
    if (!element) {
      return;
    }

    const key = clonedChildren?.key;

    if (typeof key !== 'string') {
      setClonedChildren(null);
      return;
    }

    const [prefix] = key.split('-', 1);
    const id = key.substring(prefix.length + 1);

    Promise.resolve(animation(id, element)).then(() => {
      setClonedChildren(null);
    });
  }, [animation, clonedChildren, element]);

  return (
    <>
      {children}
      {clonedChildren ? cloneElement(clonedChildren, {ref: setElement}) : null}
    </>
  );
}
