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
          padding: 0 !important;
        }
      `}
    </style>
    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@500&display=swap"
      rel="stylesheet"
    />
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        outline: 'none',
      }}
      tabIndex={-1}
    >
      {storyFn()}
    </main>
  </>
));
