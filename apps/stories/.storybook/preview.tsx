import React, {useEffect, type PropsWithChildren} from 'react';

import {
  registerWebComponents,
  setupDarkMode,
  sharedParameters,
} from './preview-shared';

// Import shared global styles
import '../shared/styles/global.css';

// Register web components
registerWebComponents();

function DarkModeProvider({children}: PropsWithChildren) {
  useEffect(() => {
    setupDarkMode();
  }, []);

  return children;
}

const preview = {
  decorators: [
    (Story) => {
      return (
        <DarkModeProvider>
          <Story />
        </DarkModeProvider>
      );
    },
  ],
  parameters: {
    ...sharedParameters,
    options: {
      storySort: {
        order: ['Docs'],
      },
    },
  },
};

export default preview;
