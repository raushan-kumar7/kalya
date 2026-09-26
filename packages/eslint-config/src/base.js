import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.turbo/**'],
  },
  ...tseslint.configs.recommended,
  prettierConfig,
];
