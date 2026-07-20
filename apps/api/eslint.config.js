import baseConfig from '@calc/config/eslint';

export default [
  {
    ignores: ['ecosystem.config.cjs'],
  },
  ...baseConfig,
  {
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
];
