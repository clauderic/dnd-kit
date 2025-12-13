import rootConfig from '../../eslint.config.js';

export default [
  // Ignore build outputs
  {
    ignores: ['*.js', 'plugins/*.js'],
  },

  ...rootConfig,

  {
    files: ['**/*.ts'],
    rules: {
      'no-case-declarations': 'warn',
      'no-var': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
];
