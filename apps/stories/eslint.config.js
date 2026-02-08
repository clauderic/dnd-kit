import rootConfig from '../../eslint.config.js';
import reactConfig from '../../config/eslint/react.config.js';
import storybook from 'eslint-plugin-storybook';

export default [
  {
    ignores: ['.storybook/**', 'storybook-static/**'],
  },

  ...rootConfig,
  ...reactConfig,
  ...storybook.configs['flat/recommended'],

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
    },
  },

  {
    files: ['**/*.tsx'],
    rules: {
      'react/display-name': 'warn',
      'react-hooks/rules-of-hooks': 'off', // Intentional - stories use hooks in render functions
    },
  },
];
