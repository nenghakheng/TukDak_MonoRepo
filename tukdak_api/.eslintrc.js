module.exports = {
  extends: '@loopback/eslint-config',
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': 'off',
      },
    },
  ],
};
