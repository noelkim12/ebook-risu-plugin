module.exports = {
  printWidth: 80, // 한 줄 최대 길이 (default: 80 → 100~120 선호)
  tabWidth: 2, // 탭 너비
  useTabs: false, // 탭 대신 공백 사용
  semi: true, // 세미콜론 사용 여부
  singleQuote: true, // 작은따옴표 사용
  quoteProps: 'as-needed', // 객체 속성에 필요 시만 따옴표
  trailingComma: 'all', // 후행 콤마: all (멀티라인에서 마지막에도 콤마)
  bracketSpacing: true, // 객체 리터럴 중괄호 공백 { foo: bar }
  arrowParens: 'avoid', // 화살표 함수 매개변수 괄호 사용 여부
  embeddedLanguageFormatting: 'auto', // HTML 등 포함된 언어의 포맷팅 여부
  endOfLine: 'auto', // 줄바꿈 방식 (Unix: LF, Windows: CRLF)
  plugins: ['prettier-plugin-svelte'], // Svelte 플러그인
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte',
      },
    },
  ],
};
