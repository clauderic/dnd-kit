/** @jest-environment jsdom */

import React, {useLayoutEffect} from 'react';
import {render, unmountComponentAtNode} from 'react-dom';
import {act} from 'react-dom/test-utils';

import {
  MeasuringFrequency,
  MeasuringStrategy,
  useDroppableMeasuring,
} from '../src/hooks/utilities/useDroppableMeasuring';
import type {DroppableContainer} from '../src/store/types';

describe('useDroppableMeasuring', () => {
  let root: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    act(() => {
      unmountComponentAtNode(root);
    });
    root.remove();
  });

  it.each(['first', 'second'])(
    'preserves a new measurement for %s queued during the measuring commit',
    (id) => {
      const containers: DroppableContainer[] = ['first', 'second'].map(
        (id) => ({
          id,
          key: id,
          data: {current: undefined},
          disabled: false,
          node: {current: document.createElement('div')},
          rect: {current: null},
        })
      );
      let top = 0;
      let result: ReturnType<typeof useDroppableMeasuring>;
      const config = {
        strategy: MeasuringStrategy.Always,
        frequency: MeasuringFrequency.Optimized,
        measure: () => ({
          top,
          bottom: top + 20,
          left: 0,
          right: 20,
          width: 20,
          height: 20,
        }),
      };

      function Harness({resize = false}: {resize?: boolean}) {
        result = useDroppableMeasuring(containers, {
          dragging: true,
          dependencies: [],
          config,
        });

        useLayoutEffect(() => {
          if (resize) {
            top = 100;
            result.measureDroppableContainers([id]);
          }
        }, [resize]);

        return null;
      }

      act(() => {
        render(<Harness />, root);
      });

      expect(result!.droppableRects.get(id)?.top).toBe(0);

      act(() => {
        result.measureDroppableContainers(['first']);
        render(<Harness resize />, root);
      });

      expect(result!.droppableRects.get(id)?.top).toBe(100);
      expect(result!.measuringScheduled).toBe(false);
    }
  );
});
