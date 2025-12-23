## Chat Index Control
1. 현황

- [PC뷰어](../src/ui/components/viewer/pc/PCBookViewer.svelte) 해당 뷰어는 특정 chat index의 내용만을 표시하고있음. 사용자가 특정 chat index의 내용만 보는것 뿐만 아니라, 이전/다음 페이지로 이동하길 요청
- split한 페이지의 맨 처음/마지막 페이지에서 다음/이전 버튼(혹은 화살표)를 눌렀을 때, 이전/다음 chat index의 index를 탐색해서 뷰어의 내용을 새롭게 불러옴

2. 구현 prerequisition

- 문제 : [RisuAPI](../src/core/risu-api.js)에서 getAllCurrentChatMessages를 통해 가져와도, 실제로 화면에는 렌더링 등의 이슈로 인해 제한적으로 표시됨
- 해결 : [selector](../src/utils/selector.js) selector유틸리티에서 risuSelectorAll으로 LOCATOR.chatMessage.root를 전체 탐색한 뒤, data-chat-index를 배열로 추출

3. 페이지 이동 방식

- 현재 PCBookViewer에서 최소/최대 페이지에 도달한 경우, 2에서 추출한 배열에서 현재 chat-index로부터 이전/다음 chat index의 html을 추출하여 PCBookViewer에 적용
- 즉, [openPCViewer](../src/ui/components/viewer/pc/viewerHelpers.js)의 openPCViewer(${chatIndex}, false)로 호출

4. UI/UX개선

- [BookHeader](../src/ui/components/viewer/pc/BookHeader.svelte) 헤더 영역에 현재 chat index가 표시되는데, 총 몇개의 chat index중 몇번째 페이지를 보고있는지 알 수 있어야함

## Character/Chat Page Detector

1. 현황
- 현재 PCBookViewer가 열려있을 때, 다른 페이지로 이동하면 뷰어 내용이 초기화되고 아무 내용도 표시되지 않음

2. 구현 방안

- PCBookViewer props에 chatPage, chaId를 가지고있음
- RisuAPI.subscribeToChar를 통해서 chatPage와 chaId를 subscribe하여 변경 감지
- 변경이 감지되었을 때, viewerHelper - openPCViewer(null, false)로 호출

## New Chat Index Detector

1. 현황
- PCBookViewer가 열려있을 때, 채팅을 입력하고 입력을 받았을 때, 즉 risuSelector(LOCATOR.chatScreen.root)내부에 새로운 .risu-chat element가 추가되어도 알 수 없음

2. 구현 방안
- 요구사항 : [## Chat Index Control] 과정에서 생성한 배열 갱신 및 toast알림 
- 방안1. RisuAPI.subscribeToChar를 통한 구현
- 방안2. RisuAPI.addRisuScriptHandler를 통해 input, output를 통한 구현 

