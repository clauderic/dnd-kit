import rootConfig from '../../eslint.config.js';
import reactConfig from '../../config/eslint/react.config.js';

export default [
  // Ignore build outputs
  {
    ignores: ['*.js'],
  },

  ...rootConfig,
  ...reactConfig,

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
];
