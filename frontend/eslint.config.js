import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'node_modules',
    'playwright-report',
    'test-results',
    'coverage',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Cross-feature isolation: outside code may only touch a feature via its
      // public barrel. Internal feature files use relative imports.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*/*'],
              message:
                'Import features through their public barrel only (e.g. `@features/auth`). Internal feature imports must use relative paths.',
            },
            {
              group: ['@mocks/*', '@mocks'],
              message:
                'Components/features must not import from @mocks directly. Go through the service hooks → apiClient layer (see ARCHITECTURE.md).',
            },
          ],
        },
      ],
    },
  },
  {
    // The apiClient is the single sanctioned consumer of the mock layer.
    files: ['src/lib/**/*.{ts,tsx}', 'src/mocks/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'vitest.setup.ts', 'e2e/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
])
