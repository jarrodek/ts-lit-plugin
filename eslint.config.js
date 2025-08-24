import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  // Base ignores - apply to all configurations
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.min.*',
      '*.d.ts',
      '.wireit/**',
      '.github/',
      '.husky/',
      '.vscode/',
      'scripts/',
      'CHANGELOG.md',
      'package-lock.json',
    ],
  },
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  // TypeScript files with type-checking
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      // Import rules
      'import/order': [
        'error',
        {
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'ignore',
          'alphabetize': { order: 'asc' },
        },
      ],

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-redeclare': 'off',
    },
  },
  prettier,
]
