import rootConfig from '../../eslint.config.js';

export default [
  ...rootConfig,

  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
];
