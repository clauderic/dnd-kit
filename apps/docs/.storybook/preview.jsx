import React from 'react';
import {Unstyled, Title} from '@storybook/blocks';

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
