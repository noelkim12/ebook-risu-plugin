# 이북 Risu 뷰어 플러그인

## BookButton을 통한 뷰어
@[BookButton](/src/ui/components/BookButton.svelte)
- BookButton 클릭 시 하위 로직 실행

### PC

- 개요
  @[BookButton](/src/ui/components/BookButton.svelte)
  클릭 시 div.default-chat-screen > div.flex.flex-col-reverse위에 표시되는 ebook viewer표시
  viewer component는 mobile, PC 각각 구현

- 작동 방식
  BookButton을 통해 Viewer를 호출할 경우,
  [risu-api](/src/core/risu-api.js)
  risu-api내부의 getLastChatIndex를 사용하여 마지막 chat index를 가져온 뒤,
  [selector util](/src/utils/selector.js)
  getChatElementByChatIndex를 사용하여 마지막 채팅의 HTML획득 한 뒤 이를 인자로 viewer표시
  추후 [SmallBookButton](/src/ui/components/SmallBookButton.svelte)을 통해서 특정 chat index를 뷰어로 볼 가능성을 염두에 두고 작업 필요

- 화면 구현
  [PC VIEWER HTML](/rfp/book-viewer.html)
  [PC VIEWER JS](/rfp/book-viewer.js)
  [PC VIEWER CSS](/rfp/book-viewer.css)
  [text-spliiter 로직](/rfp/text-splitter-pc.js)

1. 즉시 적용할 수 있도록 JS에서 채팅 HTML을 가져온 예시를 적용해놓았으므로 이를 토대로 작업
2. div.default-chat-screen > div.flex.flex-col-reverse크기에 맞춰서 표시되어야하며, 화면크기 조정에 대비하여 resize observer필요

- 컴포넌트 디렉토리
  UI 디렉토리 : @src/ui/components/viewer/pc/
  코어 로직 디렉토리 : @src/core/viewer/pc/

- 유의 사항
  특정 액션 등을 통하여 getChatElementByChatIndex를 통해 가져온 HTML이 변경될 수 있으므로, 뷰어가 표시되어있을 때 주기적으로 내용 변경을 체크하여 뷰어에 반영 필요

** 중요 **
!!예시로 제공한 HTML,JS가 반드시 빠짐없이 구현되어야 함!!
  
### MOBILE

- PC버전 작업 완료 후 진행 예정
