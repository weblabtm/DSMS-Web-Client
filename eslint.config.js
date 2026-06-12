import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // 1. Restrict raw fetch calls
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: [
      'src/shared/api/http-client.js',
      'src/shared/api/authApi.js',
      'src/shared/config/runtime-config.js',
      'src/pages/auth/**/*.{js,jsx}',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="fetch"]',
          message: 'Do not use raw fetch() directly. All authenticated requests must go through a BaseApiClient subclass. Pre-session authentication calls must use authApi.js.',
        },
      ],
    },
  },
  // 2. Restrict direct imports from http-client.js for domain API files (since they must only use BaseApiClient)
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: [
      'src/shared/api/BaseApiClient.js',
      'src/shared/api/dsms-api.js',
      'src/shared/api/http-client.js',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'shared/api/http-client',
              message: 'Do not import from http-client directly. Extend BaseApiClient instead.',
            },
            {
              name: '@/shared/api/http-client',
              message: 'Do not import from http-client directly. Extend BaseApiClient instead.',
            },
          ],
          patterns: [
            {
              group: ['**/http-client', '**/http-client.js'],
              message: 'Do not import from http-client directly. Extend BaseApiClient instead.',
            },
          ],
        },
      ],
    },
  },
  // 3. Restrict both http-client and BaseApiClient imports for UI/page components
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: [
      'src/entities/*/api/*.js',
      'src/shared/api/BaseApiClient.js',
      'src/shared/api/dsms-api.js',
      'src/shared/api/http-client.js',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'shared/api/http-client',
              message: 'Do not import from http-client directly. Extend BaseApiClient instead.',
            },
            {
              name: '@/shared/api/http-client',
              message: 'Do not import from http-client directly. Extend BaseApiClient instead.',
            },
          ],
          patterns: [
            {
              group: ['**/http-client', '**/http-client.js'],
              message: 'Do not import from http-client directly. Extend BaseApiClient instead.',
            },
            {
              group: ['**/BaseApiClient', '**/BaseApiClient.js'],
              message: 'BaseApiClient must only be imported inside domain API modules (src/entities/*/api/*Api.js).',
            },
          ],
        },
      ],
    },
  },
])
