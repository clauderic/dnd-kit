import {addons} from '@storybook/manager-api';
import type {API_PreparedIndexEntry, API_StatusObject} from '@storybook/types';

import {theme} from './theme';

addons.setConfig({
  theme,
  showPanel: false,
});

addons.setConfig({
  sidebar: {
    filters: {
      patterns: (
        item: API_PreparedIndexEntry & {
          status: Record<string, API_StatusObject | null>;
        }
      ): boolean => {
        return !(item.tags ?? []).includes('hidden');
      },
    },
  },
});
