import rootConfig from '../../eslint.config.js';

export default [
  // Ignore build outputs
  {
    ignores: ['*.js'],
  },

  ...rootConfig,

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
];
