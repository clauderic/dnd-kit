import React from 'react';

import {restrictToWindowEdges} from '@dropshift/core';
import {clientRectSortingStrategy} from '@dropshift/sortable';

import {Sortable, Props as SortableProps} from '../Sortable';
import {GridContainer} from '../../components';

export default {
  title: 'Presets|Sortable/Grid',
};

const props: Partial<SortableProps> = {
  adjustScale: true,
  Container: (props: any) => <GridContainer {...props} columns={5} />,
  strategy: clientRectSortingStrategy,
  wrapperStyle: () => ({
    width: 140,
    height: 140,
  }),
  translateModifiers: [restrictToWindowEdges],
};

export const BasicSetup = () => <Sortable {...props} />;

export const WithoutClone = () => <Sortable {...props} useClone={false} />;

export const LargeFirstTile = () => (
  <Sortable
    {...props}
    getItemStyles={({index}) => {
      if (index === 0) {
        return {
          fontSize: '2rem',
          padding: '36px 40px',
        };
      }

      return {};
    }}
    wrapperStyle={({index}) => {
      if (index === 0) {
        return {
          height: 288,
          gridRowStart: 'span 2',
          gridColumnStart: 'span 2',
        };
      }

      return {
        width: 140,
        height: 140,
      };
    }}
  />
);

export const VariableSizes = () => (
  <Sortable
    {...props}
    itemCount={14}
    getItemStyles={({index}) => {
      if (index === 0 || index == 9) {
        return {
          fontSize: '2rem',
          padding: '36px 40px',
        };
      }

      return {};
    }}
    wrapperStyle={({index}) => {
      if (index === 0 || index == 9) {
        return {
          height: 288,
          gridRowStart: 'span 2',
          gridColumnStart: 'span 2',
        };
      }

      return {
        width: 140,
        height: 140,
      };
    }}
  />
);

export const DragHandle = () => <Sortable {...props} handle />;

export const ScrollContainer = () => (
  <div
    style={{
      height: '50vh',
      margin: '0 auto',
      overflow: 'auto',
    }}
  >
    <Sortable {...props} />
  </div>
);

export const PressDelay = () => (
  <Sortable
    {...props}
    activationConstraint={{
      delay: 250,
      tolerance: 5,
    }}
  />
);

export const MinimumDistance = () => (
  <Sortable
    {...props}
    activationConstraint={{
      distance: 15,
    }}
  />
);
