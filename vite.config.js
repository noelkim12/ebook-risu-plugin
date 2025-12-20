/**
 * Vite 설정 파일 (Svelte)
 *
 * 일반적인 작성 규칙:
 * 1. build.lib: 라이브러리 모드로 빌드 설정
 * 2. build.lib.formats: CDN 배포용 'iife' 형식 사용
 * 3. plugins: 필요한 플러그인들을 배열로 추가
 * 4. css: CSS Modules 설정
 */

import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

import { vitePluginArgs } from './scripts/vite-plugin-args.js';
import { vitePluginDevMode } from './scripts/vite-plugin-devmode.js';

// Package.json 읽기
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// 유틸리티 함수들 (임시로 여기 정의, 추후 별도 파일로 분리)
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

function toKebabCase(str) {
  return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/, '');
}

// Plugin Args 읽기
function getPluginArgs() {
  const argsPath = path.resolve(__dirname, 'src/plugin-args.json');
  if (fs.existsSync(argsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(argsPath, 'utf-8'));

      // args 배열이 없으면 빈 문자열 반환
      if (!data.args || !Array.isArray(data.args) || data.args.length === 0) {
        return '';
      }

      // 각 arg를 "//@arg {name} {type}" 형식으로 변환
      return data.args.map(arg => `//@arg ${arg.name} ${arg.type}`).join('\n');
    } catch (error) {
      console.warn('Failed to read plugin-args.json:', error);
      return '';
    }
  }
  return '';
}

// 개발 모드 배너 생성
function getDevModeBanner() {
  if (process.env.NODE_ENV === 'development') {
    const portFilePath = path.resolve(__dirname, '.dev-server-port');
    if (fs.existsSync(portFilePath)) {
      const port = fs.readFileSync(portFilePath, 'utf-8').trim();
      return `//@dev-server-port ${port}`;
    }
  }
  return '';
}

// Banner를 강제로 최상단에 추가하는 플러그인
function viteBannerPlugin() {
  const banner = `//@name ${pkg.name}
//@display-name ${pkg.name}_v${pkg.version}
//@version ${pkg.version}
//@description ${pkg.description}
${getPluginArgs()}
${getDevModeBanner()}
//@link https://unpkg.com/${pkg.name}@${pkg.version}/dist/${toKebabCase(pkg.name)}.js
`;

  return {
    name: 'vite-banner-plugin',
    enforce: 'post', // CSS injection 이후에 실행
    generateBundle(options, bundle) {
      // 모든 JS 파일에 banner 추가
      for (const fileName in bundle) {
        const file = bundle[fileName];
        if (file.type === 'chunk' && fileName.endsWith('.js')) {
          file.code = banner + file.code;
        }
      }
    },
  };
}

export default defineConfig({
  // 라이브러리 빌드 설정
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: toCamelCase(pkg.name), // 전역 변수명 (camelCase)
      fileName: () => `${toKebabCase(pkg.name)}.js`, // 출력 파일명 (kebab-case)
      formats: ['umd'], // CDN 배포용 즉시 실행 함수
    },
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false, // 프로덕션에서는 false

    rollupOptions: {
      output: {
        // CSS를 JS에 인라인으로 포함 (CDN 배포 필수)
        inlineDynamicImports: true,

        // 전역 변수명 설정
        name: toCamelCase(pkg.name),
      },
    },

    // 최적화 설정
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false, // 주석 제거 (배너는 유지됨)
      },
    },

    // Watch 모드 설정 (build --watch 시 사용)
    watch: {
      // 자동 생성 파일 무시 (무한 루프 방지)
      exclude: ['**/src/core/plugin-config.js', '**/src/core/dev-reload.js', '**/node_modules/**'],
    },
  },

  // CSS Modules 설정
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]--[hash:base64:5]',
    },
  },

  // 모듈 해석 설정
  resolve: {
    extensions: ['.js', '.svelte', '.ts', '.css'],
  },

  // 개발 서버 설정 (Vite는 자체 HMR 제공)
  server: {
    port: 13131,
    strictPort: false,
    open: false,
    hmr: true, // Hot Module Replacement 활성화
    watch: {
      ignored: [
        // 자동 생성되는 파일들은 watch에서 제외 (무한 루프 방지)
        '**/src/core/plugin-config.js',
        '**/src/core/dev-reload.js',
        '**/node_modules/**',
      ],
    },
  },

  // Define 플러그인 (빌드 타임 상수 주입)
  define: {
    __PLUGIN_NAME__: JSON.stringify(pkg.name),
    __PLUGIN_VERSION__: JSON.stringify(pkg.version),
    __PLUGIN_DESCRIPTION__: JSON.stringify(pkg.description),
    __DEV_MODE__: JSON.stringify(process.env.NODE_ENV === 'development'),
    // 브라우저 환경용: process.env.NODE_ENV를 문자열로 치환
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },

  // 플러그인
  plugins: [
    // Svelte 플러그인
    svelte({
      compilerOptions: {
        // Svelte 5 runes 모드 활성화
        runes: true,
      },
      // 특정 라이브러리는 레거시 모드로 컴파일 (lucide-svelte 등)
      dynamicCompileOptions({ filename }) {
        if (filename.includes('node_modules')) {
          return { runes: undefined }; // node_modules는 자동 감지
        }
      },
      // CSS를 JS에 포함
      emitCss: false,
    }),

    // CSS를 JS에 인라인으로 삽입 (CDN 배포를 위해 단일 파일로 번들링)
    cssInjectedByJsPlugin(),

    // Plugin Args 자동 생성 (plugin-args.json → src/core/plugin-config.js)
    vitePluginArgs({
      argsFilePath: path.resolve(__dirname, 'src/plugin-args.json'),
      outputFilePath: path.resolve(__dirname, 'src/core/plugin-config.js'),
    }),

    // 개발 모드 Hot Reload (.dev-server-port → src/core/dev-reload.js)
    vitePluginDevMode({
      defaultPort: 13131,
      portFilePath: path.resolve(__dirname, '.dev-server-port'),
      outputFilePath: path.resolve(__dirname, 'src/core/dev-reload.js'),
    }),

    // Banner를 최상단에 추가 (CSS injection 이후)
    viteBannerPlugin(),
  ],
});
