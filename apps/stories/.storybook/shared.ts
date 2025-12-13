import {dirname, join} from 'path';
import {mergeConfig, type UserConfig} from 'vite';

/**
 * Resolve the absolute path of a package.
 * Needed in projects that use Yarn PnP or are set up within a monorepo.
 */
export function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

/**
 * Shared addons configuration for all framework Storybooks.
 */
export function getAddons(): string[] {
  return [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@vueless/storybook-dark-mode'),
    getAbsolutePath('@storybook/addon-docs'),
  ];
}

/**
 * Shared Vite configuration for all framework Storybooks.
 */
export async function sharedViteFinal(config: UserConfig): Promise<UserConfig> {
  return mergeConfig(config, {
    define: {
      'process.env': {},
    },
    optimizeDeps: {
      exclude: ['@dnd-kit/*'],
    },
  });
}
