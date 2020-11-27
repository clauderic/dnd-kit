import React from 'react';
import {addDecorator} from '@storybook/react';

addDecorator((storyFn) => (
  <>
    <style type="text/css">
      {`
        html {
          background-color: #FCFCFC;
          font-family: -apple-system, BlinkMacSystemFont, San Francisco, Roboto, Segoe UI, Helvetica, Helvetica Neue, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        body {
          margin: 0;
        }
      `}
    </style>
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'flex-start',
        justifyContent: 'center',
        outline: 'none',
      }}
      tabIndex={-1}
    >
      {storyFn()}
    </main>
  </>
));
