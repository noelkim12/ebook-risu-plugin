# IndexedDB 가이드

이 문서는 IndexedDB를 사용하여 클라이언트 사이드에서 대용량 데이터를 저장하는 방법을 설명합니다.

## 📋 목차

- [IndexedDB란?](#indexeddb란)
- [IdbStorage 클래스 사용하기](#IdbStorage-클래스-사용하기)
- [CRUD 작업](#crud-작업)
- [실전 예제](#실전-예제)
- [커스텀 스토어 만들기](#커스텀-스토어-만들기)
- [고급 기능](#고급-기능)
- [Best Practices](#best-practices)

---

## IndexedDB란?

IndexedDB는 브라우저에서 제공하는 **로컬 데이터베이스**로, 대용량 데이터를 클라이언트에 저장할 수 있습니다.

### 주요 특징

#### ✅ **대용량 저장**
- LocalStorage: ~5MB
- SessionStorage: ~5MB
- **IndexedDB: ~수백 MB ~ 수 GB** (브라우저별 상이)

#### ✅ **구조화된 데이터**
- Key-Value 저장
- Object Store (테이블과 유사)
- Index 지원 (빠른 검색)

#### ✅ **비동기 처리**
- Promise 기반 (idb 라이브러리 사용 시)
- 메인 스레드 블로킹 없음

#### ✅ **다양한 데이터 타입**
- Blob (이미지, 파일)
- Object (JSON)
- String, Number, Boolean
- Array, Date

### LocalStorage vs IndexedDB

| 항목 | LocalStorage | IndexedDB |
|------|-------------|-----------|
| **용량** | ~5MB | ~수백 MB |
| **데이터 타입** | String만 | 모든 타입 |
| **비동기** | ❌ 동기 | ✅ 비동기 |
| **검색** | ❌ 순회만 | ✅ Index 지원 |
| **대용량 파일** | ❌ 불가 | ✅ 가능 |

---

## IdbStorage 클래스 사용하기

이 프로젝트는 `IdbStorage` 클래스를 제공하여 IndexedDB를 쉽게 사용할 수 있습니다.

### Import

```javascript
import { IdbStorage, storage } from './core/image-storage.js';

// 방법 1: 클래스 인스턴스 생성
const myStorage = new IdbStorage();

// 방법 2: 싱글톤 인스턴스 사용 (권장)
import { storage } from './core/image-storage.js';
```

### 기본 사용법

```javascript
import { storage } from './core/image-storage.js';

// 저장
await storage.save('my-key', 'my-value');

// 읽기
const value = await storage.get('my-key');

// 삭제
await storage.delete('my-key');

// 전체 조회
const allItems = await storage.getAll();

// 전체 삭제
await storage.clear();
```

---

## CRUD 작업

### Create / Update (저장)

```javascript
// 문자열 저장
await storage.save('username', 'NoelKim');

// 객체 저장
await storage.save('user', {
  id: 1,
  name: 'NoelKim',
  email: 'noel@example.com'
});

// 배열 저장
await storage.save('favorites', ['item1', 'item2', 'item3']);

// Blob 저장 (이미지)
const response = await fetch('avatar.png');
const blob = await response.blob();
await storage.save('avatar', blob);

// 날짜 저장
await storage.save('lastLogin', new Date());
```

### Read (읽기)

```javascript
// 기본 읽기
const username = await storage.get('username');
console.log(username); // 'NoelKim'

// 존재하지 않는 키
const notFound = await storage.get('nonexistent');
console.log(notFound); // undefined

// 조건부 처리
const user = await storage.get('user');
if (user) {
  console.log('User found:', user.name);
} else {
  console.log('User not found');
}

// Blob 읽기 및 표시
const avatarBlob = await storage.get('avatar');
if (avatarBlob) {
  const url = URL.createObjectURL(avatarBlob);
  document.querySelector('img').src = url;
}
```

### Delete (삭제)

```javascript
// 특정 키 삭제
await storage.delete('username');

// 존재 여부 확인 후 삭제
if (await storage.has('avatar')) {
  await storage.delete('avatar');
  console.log('Avatar deleted');
}

// 전체 삭제
await storage.clear();
console.log('All data cleared');
```

### 전체 조회 및 키 목록

```javascript
// 모든 값 가져오기
const allItems = await storage.getAll();
console.log('Total items:', allItems.length);

// 모든 키 가져오기
const keys = await storage.getAllKeys();
console.log('Keys:', keys);

// 개수 확인
const count = await storage.count();
console.log(`Total: ${count} items`);

// 존재 여부 확인
const exists = await storage.has('avatar');
if (exists) {
  console.log('Avatar exists');
}
```

---

## 실전 예제

### 예제 1: 이미지 업로드 및 저장

```javascript
import { storage } from './core/image-storage.js';

async function handleImageUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  // Blob을 IndexedDB에 저장
  await storage.save('user-avatar', file);

  // 미리보기 표시
  const url = URL.createObjectURL(file);
  document.querySelector('#avatar-preview').src = url;

  console.log('Image saved to IndexedDB');
}

// 페이지 로드 시 이미지 복원
async function loadAvatar() {
  const avatar = await storage.get('user-avatar');

  if (avatar) {
    const url = URL.createObjectURL(avatar);
    document.querySelector('#avatar-preview').src = url;
  }
}

// 이벤트 리스너 등록
document.querySelector('#avatar-input').addEventListener('change', handleImageUpload);
window.addEventListener('DOMContentLoaded', loadAvatar);
```

### 예제 2: 사용자 설정 저장

```javascript
import { storage } from './core/image-storage.js';

// 설정 저장
async function saveSettings(settings) {
  await storage.save('user-settings', {
    theme: settings.theme,
    language: settings.language,
    notifications: settings.notifications,
    updatedAt: new Date().toISOString()
  });

  console.log('Settings saved');
}

// 설정 불러오기
async function loadSettings() {
  const settings = await storage.get('user-settings');

  if (settings) {
    // 설정 적용
    applyTheme(settings.theme);
    setLanguage(settings.language);
    toggleNotifications(settings.notifications);
  } else {
    // 기본 설정 사용
    const defaultSettings = {
      theme: 'light',
      language: 'ko',
      notifications: true
    };

    await saveSettings(defaultSettings);
  }
}

// 특정 설정만 업데이트
async function updateTheme(theme) {
  const settings = await storage.get('user-settings');

  if (settings) {
    settings.theme = theme;
    settings.updatedAt = new Date().toISOString();
    await storage.save('user-settings', settings);
  }
}
```

### 예제 3: 캐시 시스템

```javascript
import { storage } from './core/image-storage.js';

// TTL을 포함한 캐시 저장
async function cacheData(key, data, ttl = 3600000) { // 1시간
  await storage.save(key, {
    data,
    cachedAt: Date.now(),
    ttl
  });
}

// 캐시에서 데이터 가져오기 (TTL 확인)
async function getCachedData(key) {
  const cached = await storage.get(key);

  if (!cached) return null;

  const age = Date.now() - cached.cachedAt;

  if (age > cached.ttl) {
    // 만료된 캐시 삭제
    await storage.delete(key);
    return null;
  }

  return cached.data;
}

// 사용 예시
async function fetchUserData(userId) {
  const cacheKey = `user-${userId}`;

  // 캐시 확인
  let user = await getCachedData(cacheKey);

  if (user) {
    console.log('Cache hit');
    return user;
  }

  // 캐시 미스 - API 호출
  console.log('Cache miss - fetching from API');
  const response = await fetch(`/api/users/${userId}`);
  user = await response.json();

  // 캐시 저장 (1시간)
  await cacheData(cacheKey, user, 3600000);

  return user;
}
```

### 예제 4: 다중 이미지 갤러리

```javascript
import { storage } from './core/image-storage.js';

// 이미지 목록 관리
class ImageGallery {
  constructor() {
    this.prefix = 'gallery-';
  }

  // 이미지 추가
  async addImage(id, blob, metadata = {}) {
    const key = `${this.prefix}${id}`;
    await storage.save(key, {
      blob,
      metadata: {
        ...metadata,
        uploadedAt: Date.now()
      }
    });
  }

  // 특정 이미지 가져오기
  async getImage(id) {
    const key = `${this.prefix}${id}`;
    return await storage.get(key);
  }

  // 모든 이미지 가져오기
  async getAllImages() {
    const keys = await storage.getAllKeys();
    const galleryKeys = keys.filter(key => key.startsWith(this.prefix));

    const images = await Promise.all(
      galleryKeys.map(key => storage.get(key))
    );

    return images.filter(img => img !== undefined);
  }

  // 이미지 삭제
  async deleteImage(id) {
    const key = `${this.prefix}${id}`;
    await storage.delete(key);
  }

  // 전체 갤러리 삭제
  async clearGallery() {
    const keys = await storage.getAllKeys();
    const galleryKeys = keys.filter(key => key.startsWith(this.prefix));

    await Promise.all(
      galleryKeys.map(key => storage.delete(key))
    );
  }
}

// 사용
const gallery = new ImageGallery();

// 이미지 추가
await gallery.addImage('img-1', imageBlob, {
  title: 'Sunset',
  description: 'Beautiful sunset view'
});

// 갤러리 표시
const images = await gallery.getAllImages();
images.forEach(({ blob, metadata }) => {
  const url = URL.createObjectURL(blob);
  console.log(metadata.title, url);
});
```

---

## 커스텀 스토어 만들기

프로젝트의 요구사항에 맞는 커스텀 스토어를 만들 수 있습니다.

### 기본 커스텀 스토어

```javascript
import { openDB } from 'idb';

class CustomStorage {
  constructor(dbName, storeName) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = 1;
  }

  async _initDB() {
    return openDB(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      },
    });
  }

  async save(key, value) {
    const db = await this._initDB();
    await db.put(this.storeName, value, key);
  }

  async get(key) {
    const db = await this._initDB();
    return await db.get(this.storeName, key);
  }

  async delete(key) {
    const db = await this._initDB();
    await db.delete(this.storeName, key);
  }

  async getAll() {
    const db = await this._initDB();
    return await db.getAll(this.storeName);
  }

  async clear() {
    const db = await this._initDB();
    await db.clear(this.storeName);
  }
}

// 사용
const cacheStorage = new CustomStorage('my-cache-db', 'cache-store');
await cacheStorage.save('key', 'value');
```

### Index를 사용하는 고급 스토어

```javascript
import { openDB } from 'idb';

class UserStorage {
  constructor() {
    this.dbName = 'users-db';
    this.storeName = 'users';
    this.version = 1;
  }

  async _initDB() {
    return openDB(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', {
            keyPath: 'id',
            autoIncrement: true
          });

          // Index 생성 (빠른 검색용)
          store.createIndex('email', 'email', { unique: true });
          store.createIndex('name', 'name', { unique: false });
        }
      },
    });
  }

  // 사용자 추가
  async addUser(user) {
    const db = await this._initDB();
    return await db.add(this.storeName, user);
  }

  // ID로 사용자 찾기
  async getUserById(id) {
    const db = await this._initDB();
    return await db.get(this.storeName, id);
  }

  // 이메일로 사용자 찾기 (Index 사용)
  async getUserByEmail(email) {
    const db = await this._initDB();
    return await db.getFromIndex(this.storeName, 'email', email);
  }

  // 이름으로 검색 (Index 사용)
  async getUsersByName(name) {
    const db = await this._initDB();
    return await db.getAllFromIndex(this.storeName, 'name', name);
  }

  // 사용자 업데이트
  async updateUser(user) {
    const db = await this._initDB();
    return await db.put(this.storeName, user);
  }

  // 사용자 삭제
  async deleteUser(id) {
    const db = await this._initDB();
    await db.delete(this.storeName, id);
  }

  // 모든 사용자 가져오기
  async getAllUsers() {
    const db = await this._initDB();
    return await db.getAll(this.storeName);
  }
}

// 사용
const userStorage = new UserStorage();

// 사용자 추가
const userId = await userStorage.addUser({
  name: 'NoelKim',
  email: 'noel@example.com',
  age: 25
});

// 이메일로 검색 (빠름 - Index 사용)
const user = await userStorage.getUserByEmail('noel@example.com');
console.log(user);
```

---

## 고급 기능

### 트랜잭션 사용

```javascript
import { openDB } from 'idb';

async function transferData() {
  const db = await openDB('my-db', 1);

  // 트랜잭션 시작
  const tx = db.transaction('store', 'readwrite');
  const store = tx.objectStore('store');

  try {
    // 여러 작업을 하나의 트랜잭션으로 묶기
    await store.put('value1', 'key1');
    await store.put('value2', 'key2');
    await store.delete('key3');

    // 트랜잭션 완료 대기
    await tx.done;

    console.log('Transaction completed');
  } catch (error) {
    console.error('Transaction failed:', error);
    // 자동 롤백
  }
}
```

### 커서를 사용한 대량 데이터 처리

```javascript
import { openDB } from 'idb';

async function processAllUsers() {
  const db = await openDB('users-db', 1);
  const tx = db.transaction('users', 'readonly');
  const store = tx.objectStore('users');

  // 커서로 순회
  let cursor = await store.openCursor();

  while (cursor) {
    console.log('Processing:', cursor.value);

    // 다음 항목으로 이동
    cursor = await cursor.continue();
  }

  await tx.done;
}
```

### 버전 업그레이드

```javascript
import { openDB } from 'idb';

async function initDB() {
  return openDB('my-db', 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // 버전 1 -> 2 업그레이드
      if (oldVersion < 1) {
        db.createObjectStore('users');
      }

      if (oldVersion < 2) {
        // 새 스토어 추가
        db.createObjectStore('posts');

        // 기존 스토어에 Index 추가
        const userStore = transaction.objectStore('users');
        userStore.createIndex('email', 'email');
      }
    },
  });
}
```

---

## Best Practices

### 1. 에러 핸들링

```javascript
try {
  await storage.save('key', value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    console.error('Storage quota exceeded');
    // 오래된 데이터 삭제 또는 사용자에게 알림
  } else {
    console.error('Storage error:', error);
  }
}
```

### 2. 용량 관리

```javascript
// 저장 전 용량 확인
async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage;
    const quota = estimate.quota;
    const percentUsed = (usage / quota) * 100;

    console.log(`Storage: ${percentUsed.toFixed(2)}% used`);

    if (percentUsed > 90) {
      console.warn('Storage almost full!');
      // 정리 작업 수행
    }
  }
}
```

### 3. 네임스페이스 사용

```javascript
// 키에 접두사 사용
const CACHE_PREFIX = 'cache:';
const USER_PREFIX = 'user:';

await storage.save(`${CACHE_PREFIX}api-data`, data);
await storage.save(`${USER_PREFIX}avatar`, blob);

// 특정 네임스페이스만 삭제
async function clearCache() {
  const keys = await storage.getAllKeys();
  const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

  await Promise.all(cacheKeys.map(key => storage.delete(key)));
}
```

### 4. 압축 사용 (큰 데이터)

```javascript
// CompressionStream API 사용 (modern browsers)
async function compressData(data) {
  const blob = new Blob([JSON.stringify(data)]);
  const stream = blob.stream().pipeThrough(
    new CompressionStream('gzip')
  );

  const compressedBlob = await new Response(stream).blob();
  return compressedBlob;
}

async function decompressData(compressedBlob) {
  const stream = compressedBlob.stream().pipeThrough(
    new DecompressionStream('gzip')
  );

  const decompressedBlob = await new Response(stream).blob();
  const text = await decompressedBlob.text();
  return JSON.parse(text);
}

// 사용
const compressed = await compressData(largeObject);
await storage.save('large-data', compressed);

const retrievedCompressed = await storage.get('large-data');
const original = await decompressData(retrievedCompressed);
```

### 5. Singleton 패턴

```javascript
// IdbStorage는 이미 Singleton export 제공
import { storage } from './core/image-storage.js';

// 모든 곳에서 동일한 인스턴스 사용
await storage.save('key', 'value');
```

---

## 📚 추가 리소스

- **[idb 라이브러리](https://github.com/jakearchibald/idb)**: IndexedDB Promise 래퍼
- **[IndexedDB MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)**: IndexedDB 공식 문서
- **[개발 가이드](development-guide.md)**: Web Components 및 전체 개발 가이드
- **[CSS Modules 가이드](css-modules.md)**: CSS Modules 사용법
