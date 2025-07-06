import {addons} from '@storybook/manager-api';
import type {API_PreparedIndexEntry} from '@storybook/types';

import {theme} from './theme';

addons.setConfig({
  theme,
  showPanel: false,
});

addons.setConfig({
  sidebar: {
    filters: {
      patterns: (item: API_PreparedIndexEntry): boolean => {
        return !(item.tags ?? []).includes('hidden');
      },
    },
  },
});
