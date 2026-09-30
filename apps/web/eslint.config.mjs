import nextConfig from '@kalya/eslint-config/next';

export default [
  ...nextConfig,
  {
    ignores: ['.next/**', 'out/**', 'dist/**', 'node_modules/**'],
  },
];
