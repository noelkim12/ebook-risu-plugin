import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // Svelte 5 runes 모드 활성화
  compilerOptions: {
    runes: true,
  },
  // CSS 전처리기 지원
  preprocess: vitePreprocess(),
};
