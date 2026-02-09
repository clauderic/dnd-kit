import '@dnd-kit/stories-shared/register';

const preview = {
  parameters: {
    darkMode: {
      stylePreview: true,
    },
    options: {
      storySort: {
        order: [
          'Draggable',
          'Droppable',
          'Sortable',
          [
            'Vertical list',
            'Horizontal list',
            'Grid',
            'Multiple lists',
          ],
        ],
      },
    },
  },
};

export default preview;
