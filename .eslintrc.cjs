module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:svelte/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
    },
  ],
  rules: {
    'prettier/prettier': 'warn',
    'no-undef': 'off',
    'simple-import-sort/imports': [
      'warn',
      {
        // import 순서 정의
        groups: [
          ['^node:'],
          ['^\u0000'],
          ['^svelte'],
          ['^@?\\w'],
          ['^\\./.*\\.s?css$', '^\\./'],
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'warn',
  },
};
