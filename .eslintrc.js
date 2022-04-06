module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
    }],
    'import/prefer-default-export': 'off',
    'func-names': 'off',
    '@typescript-eslint/return-await': 'off',
  },
};
