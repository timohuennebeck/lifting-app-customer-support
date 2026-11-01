import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src/routeTree.gen.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // Supabase's types need type aliases (interfaces lack the index signatures it checks for).
  {
    files: ['src/shared/data/database.types.ts'],
    rules: { '@typescript-eslint/consistent-type-definitions': 'off' },
  },
  // Route files export their route object beside the component.
  { files: ['src/routes/**'], rules: { 'react-refresh/only-export-components': 'off' } },
);
