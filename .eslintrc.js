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
          ['^node:'], // node 내장 모듈
          ['^\\u0000'], // side effect imports (e.g. import './style.css')
          ['^svelte'], // svelte 관련 모듈
          ['^@?\\w'], // 외부 라이브러리
          ['^\\./.*\\.s?css$', '^\\./'], // css 파일 먼저, 나머지 상대 경로
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'], // 상위 디렉토리 상대경로 import
        ],
      },
    ],
    'simple-import-sort/exports': 'warn',
  },
};
