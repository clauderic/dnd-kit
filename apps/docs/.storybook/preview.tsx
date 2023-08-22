import React from 'react';
import {Unstyled} from '@storybook/blocks';

import {Code} from '../stories/components';

const preview = {
  parameters: {
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
    options: {
      storySort: {
        order: [
          'Docs',
          'React',
          [
            'Draggable',
            'Droppable',
            'Sortable',
            ['Vertical', 'Horizontal', 'Grid'],
          ],
        ],
      },
    },
  },
};

export default preview;
