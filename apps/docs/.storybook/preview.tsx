import React from 'react';
import {Unstyled} from '@storybook/blocks';

import {Button, Code} from '../stories/components';

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
    darkMode: {
      stylePreview: true,
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
