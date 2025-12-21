## RisuAPI.getChar()의 타입 명세

- 주 사용 type외에는 삭제

```typescript
export interface character {
  type?: 'character'; // 캐릭터 타입
  name: string; // 캐릭터 이름
  image?: string; // 캐릭터 썸네일 이미지
  firstMessage: string; // 캐릭터 first message
  desc: string; // 캐릭터 설명(역할 프롬프트)
  notes: string; // 유저 노트
  chats: Chat[]; // 채팅(채팅방)
  chatFolders: ChatFolder[]; // 채팅 폴더
  chatPage: number; // 현재 채팅중인 chats의 index
  chaId: string; // 캐릭터 ID
  utilityBot: boolean; // 유틸리티봇 여부
  exampleMessage: string; // 예시 메세지
  creatorNotes: string; // 제작자 메모
  systemPrompt: string; // 시스템 프롬프트 - 메인 프롬프트가 비어있지 않은 경우 설정에서 메인 프롬프트를 대체하는 프롬프트
  alternateGreetings: string[]; // 추가 퍼스트 메세지
  tags: string[]; // 태그
  creator: string; // 제작자 명칭
  characterVersion: string; // 캐릭터 버전
  firstMsgIndex: number; // 사용중인 퍼스트 메세지의 index(alternateGreetings의 인덱스)
  additionalAssets?: [string, string, string][]; // 추가 에셋, ['에셋명칭', '에셋경로', '확장자']
  replaceGlobalNote: string; // 글로벌 노트 덮어쓰기용 텍스트
  backgroundHTML?: string; // 채팅 화면의 배경에 삽입 될 마크다운/HTML 데이터
  reloadKeys?: number; // 리로드용 키
  backgroundCSS?: string; // 백그라운드 CSS
  license?: string; // 라이센스
  creation_date?: number; // 생성일시
  modification_date?: number; // 수정일시시
  defaultVariables?: string; // 기본 변수
  lowLevelAccess?: boolean; // 저수준 접근 허용 여부
  hideChatIcon?: boolean; // 썸네일 아이콘 표시 여부
  translatorNote?: string; // 번역가의 노트 - LLM번역 시 사용되는 프롬프트
  escapeOutput?: boolean; // 출력 이스케이프 여부
}

export interface Chat {
  message: Message[]; // 채팅 메세지
  note: string;
  name: string; // 채팅 이름
  localLore: loreBook[]; // 채팅방 로어북
  hypaV2Data?: SerializableHypaV2Data; // 하이파메모리 데이터
  lastMemory?: string;
  suggestMessages?: string[];
  isStreaming?: boolean;
  scriptstate?: { [key: string]: string | number | boolean };
  modules?: string[];
  id?: string;
  bindedPersona?: string;
  fmIndex?: number;
  hypaV3Data?: SerializableHypaV3Data;
  folderId?: string;
  lastDate?: number;
}

export interface Message {
  role: 'user' | 'char';
  data: string;
  saying?: string;
  chatId?: string;
  time?: number;
  generationInfo?: MessageGenerationInfo;
  promptInfo?: MessagePresetInfo;
  name?: string;
  otherUser?: boolean;
}

export interface HypaV2Data {
  lastMainChunkID: number; // can be removed, but exists to more readability of the code.
  mainChunks: {
    // summary itself
    id: number;
    text: string;
    chatMemos: Set<string>; // UUIDs of summarized chats
    lastChatMemo: string;
  }[];
  chunks: {
    // split mainChunks for retrieval or something. Although quite uncomfortable logic, so maybe I will delete it soon.
    mainChunkID: number;
    text: string;
  }[];
}

// Reuse HypaV2Data and override only chatMemos in mainChunks
export interface SerializableHypaV2Data extends Omit<HypaV2Data, 'mainChunks'> {
  mainChunks: {
    id: number;
    text: string;
    chatMemos: string[]; // Override Set<string> with string[]
    lastChatMemo: string;
  }[];
}
```
