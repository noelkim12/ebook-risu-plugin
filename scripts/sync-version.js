#!/usr/bin/env node

/**
 * constants.js의 PLUGIN_VERSION을 읽어서 package.json의 version을 동기화하는 스크립트 (ESM 버전)
 * 사용법: node scripts/sync-version.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ESM에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 경로 설정
const constantsPath = path.join(__dirname, '../src/constants.js');
const packageJsonPath = path.join(__dirname, '../package.json');

try {
  // constants.js 파일 읽기
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');

  // PLUGIN_VERSION 추출 (정규식 사용)
  const versionMatch = constantsContent.match(/export const PLUGIN_VERSION = ["']([^"']+)["']/);

  if (!versionMatch) {
    console.error('❌ constants.js에서 PLUGIN_VERSION을 찾을 수 없습니다.');
    process.exit(1);
  }

  const pluginVersion = versionMatch[1];
  console.log(`📖 constants.js에서 발견된 버전: ${pluginVersion}`);

  // package.json 읽기
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);

  // 현재 package.json 버전과 비교
  const currentVersion = packageJson.version;
  console.log(`📦 package.json 현재 버전: ${currentVersion}`);

  if (currentVersion === pluginVersion) {
    console.log('✅ 버전이 이미 동기화되어 있습니다.');
    process.exit(0);
  }

  // package.json 버전 업데이트
  packageJson.version = pluginVersion;

  // package.json 파일에 쓰기 (들여쓰기 2칸으로 포맷팅)
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log(
    `🔄 package.json 버전이 ${currentVersion} → ${pluginVersion}으로 업데이트되었습니다.`,
  );
  console.log('✅ 버전 동기화가 완료되었습니다.');
} catch (error) {
  console.error('❌ 스크립트 실행 중 오류가 발생했습니다:', error.message);
  process.exit(1);
}
