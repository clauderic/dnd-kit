import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/*.cjs',
      '**/*.d.ts',
      '**/*.d.cts',
      '**/*.js.map',
      '**/*.cjs.map',
      '**/tsup.config.ts',
      '.changeset/**',
      'apps/docs/**',
    ],
  },

  // Base config for all JavaScript/TypeScript files
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // TypeScript settings
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'prefer-const': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Prettier must be last
  prettier
);
