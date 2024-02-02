import React from 'react';
import {Unstyled} from '@storybook/blocks';

import {Button, Dropzone, Code, Item} from '../stories/components';

// Register web components
customElements.define('button-component', Button);
customElements.define('dropzone-component', Dropzone);
customElements.define('item-component', Item);

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
            ['Vertical list', 'Horizontal list', 'Grid'],
          ],
        ],
      },
    },
  },
};

export default preview;
