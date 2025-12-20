#!/usr/bin/env node

/**
 * 릴리즈 자동화 스크립트 (ESM 버전)
 *
 * 사용법:
 *   npm run release -- patch "버그 수정: 로그인 에러 해결"
 *   npm run release -- minor "새 기능: 다크모드 지원"
 *   npm run release -- major "Breaking Change: API 구조 변경"
 *
 * 수행 작업:
 *   1. 버전 업데이트 (package.json)
 *   2. release-notes.json 업데이트
 *   3. Git commit & tag
 *   4. 빌드 (vite)
 *   5. npm publish
 *   6. Git push (tags 포함)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

// ESM에서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 사용자 입력을 받는 함수
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// 메인 함수
async function main() {
  // 인자 파싱
  const args = process.argv.slice(2);
  let versionType = args[0]; // patch, minor, major
  let releaseNote = args[1] || ''; // 릴리즈 노트 텍스트

  // 버전 타입 유효성 검사
  if (!versionType || !['patch', 'minor', 'major'].includes(versionType)) {
    console.error('❌ Error: Version type must be "patch", "minor", or "major"');
    console.log('\n사용법:');
    console.log('  npm run release -- patch "버그 수정 내용"');
    console.log('  npm run release:patch (대화형)');
    console.log('  npm run release -- minor "새 기능 설명"');
    console.log('  npm run release:minor (대화형)');
    console.log('  npm run release -- major "Breaking Change 설명"');
    console.log('  npm run release:major (대화형)');
    process.exit(1);
  }

  // 릴리즈 노트가 없으면 대화형으로 입력받기
  if (!releaseNote) {
    console.log(`\n📝 ${versionType} 버전 릴리즈를 진행합니다.`);
    releaseNote = await askQuestion('릴리즈 노트를 입력하세요: ');

    if (!releaseNote.trim()) {
      console.error('\n❌ Error: Release note is required (릴리즈 노트는 필수입니다)');
      process.exit(1);
    }
  }

  // 경로 설정
  const rootDir = path.resolve(__dirname, '..');
  const packageJsonPath = path.join(rootDir, 'package.json');
  const releaseNotesPath = path.join(rootDir, 'dist', 'release-notes.json');

  console.log('🚀 Release automation started...\n');

  // 사전 검증
  console.log('🔍 Pre-flight checks...\n');

  // 1. Git 저장소 확인
  try {
    execSync('git rev-parse --git-dir', { cwd: rootDir, stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Error: Not a git repository (Git 저장소가 아닙니다)');
    console.log('\n💡 해결 방법:');
    console.log('   git init');
    console.log('   git add .');
    console.log('   git commit -m "Initial commit"');
    process.exit(1);
  }

  // 2. Git working directory 상태 확인 (경고만 표시)
  try {
    const status = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' });
    if (status.trim()) {
      console.warn('⚠️  Warning: Git working directory has uncommitted changes');
      console.log('📝 These changes will be included in the release commit:');
      console.log(status);
      console.log('✅ Continuing with release...\n');
    } else {
      console.log('✅ Git working directory clean');
    }
  } catch (error) {
    console.error('❌ Failed to check git status (Git 상태 확인 실패)');
    process.exit(1);
  }

  // 3. npm 로그인 확인
  try {
    const whoami = execSync('npm whoami', { cwd: rootDir, encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ npm user: ${whoami.trim()}`);
  } catch (error) {
    console.error('❌ Error: Not logged in to npm (npm 로그인 필요)');
    console.log('\n💡 해결 방법:');
    console.log('   npm login');
    console.log('\n입력 항목:');
    console.log('  - Username (사용자명)');
    console.log('  - Password (비밀번호)');
    console.log('  - Email (이메일)');
    console.log('  - OTP (2FA 활성화 시)');
    process.exit(1);
  }

  // 4. 원격 저장소 확인
  try {
    execSync('git remote get-url origin', { cwd: rootDir, stdio: 'ignore' });
    console.log('✅ Git remote configured');
  } catch (error) {
    console.warn('⚠️  Warning: No git remote configured');
    console.log('💡 You may want to add a remote:');
    console.log('   git remote add origin <repository-url>');
    console.log('\nContinuing anyway...\n');
  }

  console.log('✅ All pre-flight checks passed\n');

  // 현재 버전 읽기
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  console.log(`📦 Current version: ${currentVersion}`);

  // 1. 버전 업데이트
  console.log(`\n📝 Step 1: Updating version (${versionType})...`);
  try {
    execSync(`npm version ${versionType} --no-git-tag-version`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('❌ Failed to update version (버전 업데이트 실패)');
    console.log('\n💡 일반적인 문제:');
    console.log('  1. 잘못된 버전 타입');
    console.log('     → 사용 가능: patch, minor, major');
    console.log('  2. Git 작업 디렉토리가 깨끗하지 않음');
    console.log('     → 사전 검증에서 확인되었어야 함');
    console.log('  3. package.json 문법 오류');
    console.log('     → package.json의 JSON 문법을 확인하세요');
    process.exit(1);
  }

  // 새 버전 읽기
  const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const newVersion = updatedPackageJson.version;
  console.log(`✅ Version updated: ${currentVersion} → ${newVersion}`);

  // 2. release-notes.json 업데이트
  console.log('\n📝 Step 2: Updating release notes...');

  // dist 폴더가 없으면 생성
  const distDir = path.join(rootDir, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 기존 릴리즈 노트 로드 또는 초기화
  let releaseNotes = {};
  if (fs.existsSync(releaseNotesPath)) {
    releaseNotes = JSON.parse(fs.readFileSync(releaseNotesPath, 'utf8'));
  }

  // 릴리즈 노트 타입 결정
  let noteType;
  if (versionType === 'major') {
    noteType = 'break';
  } else if (versionType === 'minor') {
    noteType = 'feat';
  } else {
    noteType = 'fix';
  }

  // 새 버전의 릴리즈 노트 추가
  releaseNotes[newVersion] = {
    released_at: new Date().toISOString(),
    mandatory: versionType === 'major', // major 버전은 필수 업데이트로 표시
    notes: [
      {
        type: noteType,
        text: releaseNote,
      },
    ],
  };

  // 파일에 저장
  fs.writeFileSync(releaseNotesPath, JSON.stringify(releaseNotes, null, 2), 'utf8');
  console.log(`✅ Release notes updated for v${newVersion}`);

  // 3. 빌드 (release-notes.json 생성 후 빌드)
  console.log('\n📝 Step 3: Building project...');
  try {
    execSync('npm run build', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('✅ Build completed');
  } catch (error) {
    console.error('❌ Build failed (빌드 실패)');
    console.log('\n💡 일반적인 문제:');
    console.log('  1. vite 설정 오류');
    console.log('     → vite.config.js 문법 오류 확인');
    console.log('  2. 의존성 누락');
    console.log('     → npm install');
    console.log('  3. 소스 코드 문법 오류');
    console.log('     → 위 콘솔 출력에서 구체적인 오류 확인');
    console.log('  4. 메모리 부족');
    console.log('     → Node 메모리 증가: NODE_OPTIONS=--max-old-space-size=4096');
    console.log('\n오류 상세:', error.message);
    process.exit(1);
  }

  // 4. Git commit & tag (모든 변경사항 포함)
  console.log('\n📝 Step 4: Creating Git commit and tag...');
  try {
    // 모든 변경사항을 하나의 커밋으로 통합 (작업 중 변경사항 + 릴리즈 변경사항)
    execSync('git add .', {
      cwd: rootDir,
      stdio: 'inherit',
    });

    const commitMessage = `v${newVersion} - ${releaseNote}`;
    execSync(`git commit -m "${commitMessage}"`, {
      cwd: rootDir,
      stdio: 'inherit',
    });

    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, {
      cwd: rootDir,
      stdio: 'inherit',
    });

    console.log(`✅ Git commit and tag created: v${newVersion}`);
  } catch (error) {
    console.error('❌ Failed to create Git commit/tag (Git 커밋/태그 생성 실패)');
    console.log('\n💡 일반적인 문제:');
    console.log('  1. Git이 초기화되지 않음');
    console.log('     → git init');
    console.log('  2. 커밋할 변경사항이 없음');
    console.log('     → 정상적인 경우입니다');
    console.log('  3. 태그가 이미 존재함');
    console.log('     → git tag -d v' + newVersion);
    console.log('  4. 커밋 메시지에 특수문자 포함');
    console.log('     → 릴리즈 노트에 따옴표나 특수문자 사용 금지');
    console.log('\n오류 상세:', error.message);
    process.exit(1);
  }

  // 5. npm publish
  console.log('\n📝 Step 5: Publishing to npm...');
  try {
    execSync('npm publish', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    console.log('✅ Published to npm successfully');
  } catch (error) {
    console.error('❌ npm publish failed (npm 배포 실패)');

    const errorMessage = error.message || '';

    console.log('\n💡 일반적인 문제:');

    if (errorMessage.includes('E403') || errorMessage.includes('403')) {
      console.log('  ❌ Error 403: Forbidden (권한 거부)');
      console.log('     가능한 원인:');
      console.log('     1. npm 로그인 안 됨');
      console.log('        → npm login');
      console.log('     2. 패키지 이름이 이미 다른 사용자가 사용 중');
      console.log('        → package.json에서 패키지 이름 변경');
      console.log('     3. 이 패키지에 배포 권한 없음');
      console.log('        → 패키지 소유자에게 권한 요청');
      console.log('     4. 조직 패키지는 멤버십 필요');
      console.log('        → 조직에 가입하거나 패키지 이름 변경');
    } else if (errorMessage.includes('E409') || errorMessage.includes('409')) {
      console.log('  ❌ Error 409: Conflict (버전 중복)');
      console.log('     → 이 버전은 이미 배포되었습니다');
      console.log('     → 실행: npm run release -- patch "새 릴리즈 노트"');
      console.log('     → 참고: 같은 버전을 재배포할 수 없습니다');
    } else if (errorMessage.includes('ENEEDAUTH')) {
      console.log('  ❌ Error: Authentication required (인증 필요)');
      console.log('     → npm login');
    } else if (errorMessage.includes('EPUBLISHCONFLICT')) {
      console.log('  ❌ Error: Publish conflict (배포 충돌)');
      console.log('     → 버전이 이미 배포됨');
      console.log('     → 버전 업데이트 후 재시도');
    } else if (errorMessage.includes('E404')) {
      console.log('  ❌ Error 404: Package not found (패키지 없음)');
      console.log('     → 첫 배포인가요? 정상입니다');
      console.log('     → 패키지 이름 사용 가능 확인: npm search <패키지명>');
    } else {
      console.log('  1. npm 로그인 안 됨');
      console.log('     → npm login');
      console.log('  2. 버전 이미 배포됨 (E409)');
      console.log('     → 같은 버전 재배포 불가');
      console.log('     → 버전 업데이트: npm run release -- patch "메시지"');
      console.log('  3. 권한 거부 (E403)');
      console.log('     → 패키지 소유권 확인');
      console.log('     → npm owner ls <패키지명>');
      console.log('  4. 네트워크 오류');
      console.log('     → 인터넷 연결 확인');
      console.log('     → 다시 시도하거나 다른 네트워크 사용');
      console.log('  5. npm 레지스트리 다운');
      console.log('     → 상태 확인: https://status.npmjs.org');
    }

    console.log('\n오류 상세:', error.message);
    console.log('\n⚠️  참고: 버전과 Git 태그는 이미 생성되었습니다.');
    console.log('재시도가 필요한 경우:');
    console.log('  1. Git 태그 삭제: git tag -d v' + newVersion);
    console.log('  2. package.json에서 버전 되돌리기');
    console.log('  3. 다시 시도');
    process.exit(1);
  }

  // 6. Git push (tags 포함)
  console.log('\n📝 Step 6: Pushing to Git repository...');
  try {
    // PowerShell/CMD 호환성을 위해 별도로 실행
    execSync('git push', {
      cwd: rootDir,
      stdio: 'inherit',
    });

    execSync('git push --tags', {
      cwd: rootDir,
      stdio: 'inherit',
    });

    console.log('✅ Pushed to Git repository with tags');
  } catch (error) {
    console.error('⚠️  Warning: Failed to push to Git (Git 푸시 실패)');

    const errorMessage = error.message || '';

    console.log('\n💡 일반적인 문제:');

    if (
      errorMessage.includes('No such remote') ||
      errorMessage.includes('does not appear to be a git repository')
    ) {
      console.log('  ❌ No remote repository configured (원격 저장소 미설정)');
      console.log('     → git remote add origin <저장소-URL>');
    } else if (
      errorMessage.includes('Authentication failed') ||
      errorMessage.includes('could not read Username')
    ) {
      console.log('  ❌ Authentication failed (인증 실패)');
      console.log('     해결 방법:');
      console.log('     1. SSH: GitHub에 SSH 키 추가');
      console.log('        → ssh-keygen -t ed25519 -C "your_email@example.com"');
      console.log('        → 공개키를 GitHub Settings > SSH Keys에 추가');
      console.log('     2. HTTPS: Personal Access Token 사용');
      console.log('        → GitHub Settings > Developer settings > Personal access tokens');
      console.log(
        '        → git remote set-url origin https://<토큰>@github.com/<사용자>/<저장소>.git',
      );
    } else if (errorMessage.includes('Permission denied')) {
      console.log('  ❌ Permission denied (권한 거부)');
      console.log('     → 저장소 권한 확인');
      console.log('     → 쓰기 권한이 있는지 확인');
    } else if (errorMessage.includes('rejected') || errorMessage.includes('failed to push')) {
      console.log('  ❌ Push rejected (푸시 거부됨)');
      console.log('     가능한 원인:');
      console.log('     1. 원격에 로컬에 없는 변경사항 존재');
      console.log('        → git pull --rebase');
      console.log('     2. 보호된 브랜치');
      console.log('        → 브랜치 보호 규칙 확인');
      console.log('     3. 강제 푸시 필요 (위험)');
      console.log('        → git push --force-with-lease');
    } else {
      console.log('  1. 원격 저장소 미설정');
      console.log('     → git remote add origin <url>');
      console.log('  2. 인증 문제');
      console.log('     → SSH 또는 Personal Access Token 설정');
      console.log('  3. 네트워크 오류');
      console.log('     → 인터넷 연결 확인');
    }

    console.log('\n📌 수동 푸시 필요:');
    console.log('   git push && git push --tags');
    console.log('\n참고: 패키지는 npm에 성공적으로 배포되었습니다!');
  }

  // 완료
  console.log('\n✨ Release automation completed successfully!\n');
  console.log('📦 Package Information:');
  console.log(`   Name: ${packageJson.name}`);
  console.log(`   Version: ${newVersion}`);
  console.log(`   Release Note: ${releaseNote}`);
  console.log(`\n🔗 View on npm: https://www.npmjs.com/package/${packageJson.name}`);
  console.log(`🔗 View on unpkg: https://unpkg.com/${packageJson.name}@${newVersion}/\n`);
}

// 메인 함수 실행
main().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
