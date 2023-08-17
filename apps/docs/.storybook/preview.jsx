import React from 'react';
import {Unstyled} from '@storybook/blocks';

import {Code} from '../stories/react/components';

export const parameters = {
  docs: {
    components: {
      pre: (props) => (
        <Unstyled>
          <pre {...props} />
        </Unstyled>
      ),
      code: Code,
    },
  },
};

const preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Docs', ['Docs']],
      },
    },
  },
};

export default preview;
