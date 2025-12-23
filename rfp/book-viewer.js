/**
 * RisuAI Book Viewer - PC Version
 * 책 형태의 뷰어로 텍스트를 표시하고 페이지 넘김 기능 제공
 */

class BookViewer {
  constructor() {
    // DOM 요소
    this.leftContent = document.querySelector('.left-content');
    this.rightContent = document.querySelector('.right-content');
    this.leftPageNum = document.querySelector('.left-page-num');
    this.rightPageNum = document.querySelector('.right-page-num');
    this.pageLeft = document.querySelector('.page-left');
    this.pageRight = document.querySelector('.page-right');
    this.pageIndicator = document.querySelector('.page-indicator');

    // 헤더 요소
    this.headerThumbnail = document.querySelector('.header-thumbnail');
    this.headerName = document.querySelector('.header-name');
    this.headerButtons = document.querySelector('.header-buttons');
    this.headerChatIndex = document.querySelector('.header-chat-index');

    // 버튼
    this.prevBtn = document.querySelector('.prev-btn');
    this.nextBtn = document.querySelector('.next-btn');
    this.clickLeft = document.querySelector('.click-left');
    this.clickRight = document.querySelector('.click-right');

    // 설정 드롭다운
    this.settingsBtn = document.querySelector('.settings-btn');
    this.settingsMenuContainer = document.querySelector('.settings-menu-container');
    this.settingsMenu = document.querySelector('.settings-menu');
    this.fontSizeInput = document.getElementById('fontSize');
    this.lineHeightInput = document.getElementById('lineHeight');
    this.themeSelect = document.getElementById('theme');

    // LB 모듈 버튼
    this.lbMenuContainer = document.querySelector('.lb-menu-container');
    this.lbBtn = document.querySelector('.lb-btn');
    this.lbMenu = document.querySelector('.lb-menu');
    this.lbModulesList = document.querySelector('.lb-modules-list');

    // 사용자 CSS 모달
    this.customCssModal = document.getElementById('customCssModal');
    this.openCustomCssBtn = document.getElementById('openCustomCss');
    this.closeCustomCssBtn = document.getElementById('closeCustomCss');
    this.customCssInput = document.getElementById('customCssInput');
    this.applyCustomCssBtn = document.getElementById('applyCustomCss');
    this.resetCustomCssBtn = document.getElementById('resetCustomCss');
    this.customStyleElement = null; // 동적으로 추가될 style 요소

    // 데이터
    this.pages = [];
    this.currentPage = 0;
    this.originalContent = null; // 원본 콘텐츠 저장용

    // 리사이즈 디바운스 타이머
    this.resizeTimer = null;

    // 디바이스 감지 및 텍스트 분할기 초기화
    this.isMobile = this.detectMobile();

    if (this.isMobile && typeof TextSplitterMobile !== 'undefined') {
      // 모바일: 세밀한 분할
      this.textSplitter = new TextSplitterMobile({
        splittableTags: ['p'],
      });
    } else if (!this.isMobile && typeof TextSplitterPC !== 'undefined') {
      // PC: 최소 분할
      this.textSplitter = new TextSplitterPC({
        splittableTags: ['p'],
        minHeightRatio: 0.85,
      });
    } else {
      // 폴백: 기존 TextSplitter 사용
      this.textSplitter = new TextSplitter({
        splittableTags: ['p'],
      });
    }

    console.log(
      `[BookViewer] Device: ${this.isMobile ? 'Mobile' : 'PC'}, Splitter: ${this.textSplitter.constructor.name}`,
    );

    // 초기화
    this.init();
  }

  /**
   * 모바일 디바이스 감지
   * @returns {boolean}
   */
  detectMobile() {
    // 화면 너비 기준 (900px 이하를 모바일로 간주)
    const isSmallScreen = window.innerWidth <= 900;

    // User Agent 기반 감지
    const isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    // 터치 지원 여부
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 화면 크기 또는 (모바일 UA + 터치)
    return isSmallScreen || (isMobileUA && hasTouch);
  }

  async init() {
    // 설정 로드 (페이지 크기 결정에 영향)
    this.loadSettings();

    // 사용자 CSS 로드
    this.loadCustomCss();

    // 이벤트 리스너 등록
    this.attachEventListeners();

    // 레이아웃 완료 대기 후 텍스트 로드
    await this.waitForLayout();
    await this.loadContent();

    // 첫 페이지 표시
    this.renderPage();
  }

  /**
   * 레이아웃이 완전히 계산될 때까지 대기
   * CSS 변수 변경이나 DOM 업데이트 후 레이아웃 재계산을 보장
   */
  waitForLayout() {
    return new Promise(resolve => {
      // 두 프레임 대기: 첫 프레임에서 스타일 적용, 두 번째 프레임에서 레이아웃 계산
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }

  async loadContent() {
    try {
      // message-area1.html 파일 로드
      //   const response = await fetch('message-area1.html');
      const html = `<div class="flex max-w-full justify-center risu-chat" data-chat-index="5" data-chat-id="6462dd5a-1e66-4677-b0ed-6f1e87b82d0b" style=""><div class="text-textcolor mt-1 ml-4 mr-4 mb-1 p-2 bg-transparent flex-grow border-t-gray-900 border-opacity-30 border-transparent flexium items-start max-w-full"><!----><!----><!----><!----><!----><!----><!----><div class="shadow-lg bg-textcolor2 rounded-md" style="background: url(&quot;/sw/img/6173736574732f353235653066633734313935366564393831393737316537326139373835623034633131326536303230343261376638373536616230623566363837363532662e706e67&quot;);background-size: cover;height:3.5rem;width:3.5rem;min-width:3.5rem"></div><!----> <span class="flex flex-col ml-4 w-full max-w-full min-w-0 text-black"><div class="flexium items-center chat-width"><!----><span class="chat-width text-xl unmargin text-textcolor">Seo Ye-jin</span><!----> <div class="risu-ebooklike-viewer-chat-message-bot-buttons flex-grow flex items-center justify-end text-textcolor2"><span class="text-xs"></span> <button class="ml-2 hover:text-blue-500 transition-colors button-icon-copy"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-copy "><!----><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><!----><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path><!----><!----><!----></svg><!----></button><!----> <!----><button class="ml-2 hover:text-blue-500 transition-colors button-icon-tts"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-volume-2 "><!----><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><!----><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><!----><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><!----><!----><!----></svg><!----></button><!----> <button class="ml-2 hover:text-blue-500 transition-colors button-icon-edit "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-pencil "><!----><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><!----><path d="m15 5 4 4"></path><!----><!----><!----></svg><!----></button> <button class="ml-2 hover:text-blue-500 transition-colors button-icon-remove"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-trash "><!----><path d="M3 6h18"></path><!----><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><!----><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><!----><!----><!----></svg><!----></button><!----><!----> <button class="ml-2 cursor-pointer hover:text-blue-500 transition-colors button-icon-translate "><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-languages "><!----><path d="m5 8 6 6"></path><!----><path d="m4 14 6-6 2-3"></path><!----><path d="M2 5h12"></path><!----><path d="M7 2h1"></path><!----><path d="m22 22-5-10-5 10"></path><!----><path d="M14 18h6"></path><!----><!----><!----></svg><!----></button><!----> <!----><button class="ml-2 hover:text-blue-500 transition-colors button-icon-unreroll dyna-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-arrow-left "><!----><path d="m12 19-7-7 7-7"></path><!----><path d="M19 12H5"></path><!----><!----><!----></svg><!----></button> <!----> <button class="ml-2 hover:text-blue-500 transition-colors button-icon-reroll dyna-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-arrow-right "><!----><path d="M5 12h14"></path><!----><path d="m12 5 7 7-7 7"></path><!----><!----><!----></svg><!----></button><!----></div><!----></div> <div class="flex flex-col items-end"><button class="text-sm p-1 text-textcolor2 border-darkborderc float-end mr-2 my-1
                            hover:ring-darkbutton hover:ring rounded-md hover:text-textcolor transition-all flex justify-center items-center"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide lucide-bot "><!----><path d="M12 8V4H8"></path><!----><rect width="16" height="12" x="4" y="8" rx="2"></rect><!----><path d="M2 14h2"></path><!----><path d="M20 14h2"></path><!----><path d="M15 13v2"></path><!----><path d="M9 13v2"></path><!----><!----><!----></svg><!----> <span class="ml-1">Plugin</span></button><!----> <!----></div><!----> <!----><!----><span class="text chat-width chattext prose minw-0 prose-invert" style="font-size: 0.875rem; line-height: 1.25rem;"><!----><!----><p><mark risu-mark="quote2">“염병?”</mark></p>
<p>예진의 입술 사이로 짧은 실소가 터져 나온다. '염병을 해라’라니. 사회생활 10년 차, 광고주들의 온갖 갑질과 팀원들의 기싸움 속에서도 들어본 적 없는 원색적인 비난이다. 그런데 이상하게도 뺨을 얻어맞은 듯한 불쾌감 너머로, 척추를 타고 찌릿한 전류가 흐른다.</p>
<p>그녀는 들고 있던 화보집을 서가에 거칠게 밀어 넣는다. 종이가 쓸리는 소리가 날카롭게 고요를 찢는다. 예진은 노엘에게 한 걸음 더 바짝 다가선다. 148cm의 작은 키 탓에 고개를 한참 치켜들어야 하지만, 그녀의 눈빛에는 상대를 제압하려는 포식자의 기운이 서려 있다.</p>
<p><mark risu-mark="quote2">“말 참 예쁘게 하시네. 그쪽은 부모님한테도 책 고를 때 방해되면 염병한다고 해요?”</mark></p>
<p>예진은 노엘의 가슴팍 근처에서 멈춘 시선을 천천히 끌어올려 그의 눈을 정면으로 응시한다. 그녀의 하얀 속눈썹이 파르르 떨린다. 분노인지, 아니면 생전 처음 겪는 무례함이 주는 기묘한 고양감인지 스스로도 확신할 수 없다.</p>
<p><mark risu-mark="quote2">“싸가지에 염병이라… 어휘력이 참 저렴해서 놀라울 정도네. 보통 이런 상황에선 <mark risu-mark="quote1">‘실례했습니다’</mark> 한마디면 끝날 일 아닌가? 아니면, 그쪽은 여자한테 이런 식으로 시비 걸면서 관심 끄는 게 전략이에요? 그렇다면 최악인데.”</mark></p>
<p>그녀는 팔짱을 낀 채로 한쪽 입꼬리를 비스듬히 올린다. 완벽하게 세팅된 백발 아래로 드러난 목선이 긴장으로 팽팽하게 당겨진다. 조말론 피오니 향기가 두 사람 사이의 좁은 틈을 메운다. 예진은 노엘의 몸에서 풍겨 나오는, 인간의 것이라고 하기엔 지나치게 서늘하고 이질적인 기운을 느낀다. 하지만 그녀는 물러서지 않는다. 오히려 그 낯선 감각이 그녀의 정복욕을 자극한다.</p>
<p><mark risu-mark="quote2">“말해봐요. 그 잘난 입으로 다음엔 또 어떤 천박한 소릴 뱉을지 궁금해지니까.”</mark></p>
<p>예진은 도발하듯 턱을 까닥인다. 그녀의 왼손 약지에서 반짝이는 결혼반지가 마치 '나는 네가 함부로 할 수 있는 여자가 아니다’라고 경고하는 듯하지만, 정작 그녀의 눈은 노엘이 이 선을 넘어오기를 기다리는 것처럼 번뜩인다.</p>

<div data-id="SNS-Forme" class="x-risu-lb-module-root">
<button risu-btn="lb-reroll__SNS-Forme" class="x-risu-lb-lazyloader">
<span class="x-risu-lb-opener"><span>🆇 SNS 불러오기<svg viewBox="0 0 15 15" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M1.8 7.5c0-2.8 2.3-5.7 5.7-5.7 2.8 0 4.2 2.1 4.7 3.2h-1.7a.5.5 0 0 0 0 1h3c.3 0 .5-.2.5-.5v-3a.5.5 0 0 0-1 0v1.8A6.3 6.3 0 0 0 7.5.8a6.7 6.7 0 1 0 0 13.4 6.5 6.5 0 0 0 6.1-4.2.5.5 0 1 0-.9-.3 5.5 5.5 0 0 1-5.2 3.5 5.6 5.6 0 0 1-5.7-5.7Z" fill-rule="evenodd" fill="currentColor"></path></svg>
</span></span>
</button>
</div>
<div data-id="lightboard-miniboard" class="x-risu-lb-module-root">
<button risu-btn="lb-reroll__lightboard-miniboard" class="x-risu-lb-lazyloader">
<span class="x-risu-lb-opener"><span>♦️미니보드 불러오기<svg viewBox="0 0 15 15" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M1.8 7.5c0-2.8 2.3-5.7 5.7-5.7 2.8 0 4.2 2.1 4.7 3.2h-1.7a.5.5 0 0 0 0 1h3c.3 0 .5-.2.5-.5v-3a.5.5 0 0 0-1 0v1.8A6.3 6.3 0 0 0 7.5.8a6.7 6.7 0 1 0 0 13.4 6.5 6.5 0 0 0 6.1-4.2.5.5 0 1 0-.9-.3 5.5 5.5 0 0 1-5.2 3.5 5.6 5.6 0 0 1-5.7-5.7Z" fill-rule="evenodd" fill="currentColor"></path></svg>
</span></span>
</button>
</div>
<div data-id="lightboard-comment" class="x-risu-lb-module-root">
<button risu-btn="lb-reroll__lightboard-comments" class="x-risu-lb-lazyloader">
<span class="x-risu-lb-opener"><span>댓글 불러오기<svg viewBox="0 0 15 15" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M1.8 7.5c0-2.8 2.3-5.7 5.7-5.7 2.8 0 4.2 2.1 4.7 3.2h-1.7a.5.5 0 0 0 0 1h3c.3 0 .5-.2.5-.5v-3a.5.5 0 0 0-1 0v1.8A6.3 6.3 0 0 0 7.5.8a6.7 6.7 0 1 0 0 13.4 6.5 6.5 0 0 0 6.1-4.2.5.5 0 1 0-.9-.3 5.5 5.5 0 0 1-5.2 3.5 5.6 5.6 0 0 1-5.7-5.7Z" fill-rule="evenodd" fill="currentColor"></path></svg>
</span></span>
</button>
</div>
<div data-id="lightboard-news" class="x-risu-lb-module-root">
<button risu-btn="lb-reroll__lightboard-news" class="x-risu-lb-lazyloader">
<span class="x-risu-lb-opener"><span>뉴스 불러오기<svg viewBox="0 0 15 15" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M1.8 7.5c0-2.8 2.3-5.7 5.7-5.7 2.8 0 4.2 2.1 4.7 3.2h-1.7a.5.5 0 0 0 0 1h3c.3 0 .5-.2.5-.5v-3a.5.5 0 0 0-1 0v1.8A6.3 6.3 0 0 0 7.5.8a6.7 6.7 0 1 0 0 13.4 6.5 6.5 0 0 0 6.1-4.2.5.5 0 1 0-.9-.3 5.5 5.5 0 0 1-5.2 3.5 5.6 5.6 0 0 1-5.7-5.7Z" fill-rule="evenodd" fill="currentColor"></path></svg>
</span></span>
</button>
</div>
<div data-id="lightboard-DynamicProfile" class="x-risu-lb-module-root">
<button risu-btn="lb-reroll__lightboard-DynamicProfile" class="x-risu-lb-lazyloader">
<span class="x-risu-lb-opener"><span>다이나믹 프로필 리롤<svg viewBox="0 0 15 15" fill="currentcolor" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M1.8 7.5c0-2.8 2.3-5.7 5.7-5.7 2.8 0 4.2 2.1 4.7 3.2h-1.7a.5.5 0 0 0 0 1h3c.3 0 .5-.2.5-.5v-3a.5.5 0 0 0-1 0v1.8A6.3 6.3 0 0 0 7.5.8a6.7 6.7 0 1 0 0 13.4 6.5 6.5 0 0 0 6.1-4.2.5.5 0 1 0-.9-.3 5.5 5.5 0 0 1-5.2 3.5 5.6 5.6 0 0 1-5.7-5.7Z" fill-rule="evenodd" fill="currentColor"></path></svg>
</span></span>
</button>
</div>
<div data-id="lightboard-NAI" class="x-risu-lb-module-root">
  <div class="x-risu-lb-nai-column">
    <details name="lightboard-NAI" class="x-risu-lb-collapsible x-risu-lb-collapsible-animated"><summary class="x-risu-lb-nai-opener">
        <span>NAI 프롬프트</span>
        <div class="x-risu-lb-nai-btn-container">
          <button type="button" risu-btn="lb-reroll__lightboard-NAI" class="x-risu-lb-nai-btn">🔄</button>
          <button risu-btn="lb-nai-generate__
[Char1] girl, mature woman, standing, arms crossed, looking up, smirk, sneering, confident expression, long white hair, wavy hair, white eyelashes, white eyeliner, large breasts (j-cup), black fitted dress, high heels, wedding ring, professional attire, aggressive pose, full body
[Scene] 1girl, solo, confrontation, tension, stylish, dramatic lighting
[Place] indoors, bookstore, book shelves, commercial building
[Angle] medium shot, slightly low angle, direct gaze, dynamic
[Video] A stylish mature woman (148cm, J-cup, white wavy hair) stands in a brightly lit bookstore aisle, looking up at the viewer with an intense gaze. Medium shot, static camera, slightly low angle. | She quickly crosses her arms, tightening her posture. | (A challenging smirk slowly forms on her lips:1.3) as she subtly tilts her head back, maintaining eye contact. | The tension in her neck muscles is visible (visible tension:1.1)." type="button" class="x-risu-lb-nai-btn">🎨</button>
        </div>
      </summary>
      <div class="x-risu-lb-nai-component-container">
        <div class="x-risu-lb-nai-add-container">
          <button type="button" risu-btn="lb-nai-add-positive" class="x-risu-lb-nai-add-btn">긍정 프롬프트 추가</button>
          <button type="button" risu-btn="lb-nai-add-authornote" class="x-risu-lb-nai-add-btn">작가의 노트</button>
          <button type="button" risu-btn="lb-nai-add-imgsize" class="x-risu-lb-nai-add-btn">이미지 크기 변경</button>
        </div>
        <div class="x-risu-lb-nai-characters-section">
          <h4>Characters</h4>
          <div class="x-risu-lb-nai-characters-grid">
            <div class="x-risu-lb-nai-character-card">
              <span class="x-risu-lb-nai-character-label">Char1</span>
              <div class="x-risu-lb-nai-division-line"></div>
              <div class="x-risu-lb-nai-character-content">
                <div class="x-risu-lb-nai-character-tags">girl, mature woman, standing, arms crossed, looking up, smirk, sneering, confident expression, long white hair, wavy hair, white eyelashes, white eyeliner, large breasts (j-cup), black fitted dress, high heels, wedding ring, professional attire, aggressive pose, full body</div>
              </div>
            </div>
          </div>
        </div>
        <div class="x-risu-lb-nai-composition-section">
          <h4>Composition</h4>
          <div class="x-risu-lb-nai-composition-grid">
            <div class="x-risu-lb-nai-comp-card">
              <span class="x-risu-lb-nai-comp-label">Scene</span>
              <div class="x-risu-lb-nai-division-line"></div>
              <div class="x-risu-lb-nai-comp-content">
                <div class="x-risu-lb-nai-comp-tags">1girl, solo, confrontation, tension, stylish, dramatic lighting</div>
              </div>
            </div>
            <div class="x-risu-lb-nai-comp-card">
              <span class="x-risu-lb-nai-comp-label">Place</span>
              <div class="x-risu-lb-nai-division-line"></div>
              <div class="x-risu-lb-nai-comp-content">
                <div class="x-risu-lb-nai-comp-tags">indoors, bookstore, book shelves, commercial building</div>
              </div>
            </div>
            <div class="x-risu-lb-nai-comp-card">
              <span class="x-risu-lb-nai-comp-label">Angle</span>
              <div class="x-risu-lb-nai-division-line"></div>
              <div class="x-risu-lb-nai-comp-content">
                <div class="x-risu-lb-nai-comp-tags">medium shot, slightly low angle, direct gaze, dynamic</div>
              </div>
            </div>
            <div class="x-risu-lb-nai-comp-card">
              <span class="x-risu-lb-nai-comp-label">Video</span>
              <div class="x-risu-lb-nai-division-line"></div>
              <div class="x-risu-lb-nai-comp-content">
                <div class="x-risu-lb-nai-comp-tags">A stylish mature woman (148cm, J-cup, white wavy hair) stands in a brightly lit bookstore aisle, looking up at the viewer with an intense gaze. Medium shot, static camera, slightly low angle. | She quickly crosses her arms, tightening her posture. | (A challenging smirk slowly forms on her lips:1.3) as she subtly tilts her head back, maintaining eye contact. | The tension in her neck muscles is visible (visible tension:1.1).</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </details>
    <div class="x-risu-lb-nai-img-container">
<img decoding="async" loading="lazy" src="sample.png">
    </div>
  </div>
</div>

<div class="x-risu-lb-wrapper">
    <style>.chattext #status-dialog-985337 .x-risu-stat-icon-jaemin img,.chattext #status-dialog-985337 .x-risu-pregnancy-header-jaemin .x-risu-stat-icon-jaemin img{width:100% !important;height:100% !important;object-fit:contain !important;display:block !important;}</style>
    <button popovertarget="status-dialog-985337" class="x-risu-lb-trigger-btn">
        📊 Ero Status (Open)
    </button>
    <div popover="" class="x-risu-lb-dialog" id="status-dialog-985337">
        <div class="x-risu-lb-close-area">
             <button popovertargetaction="hide" popovertarget="status-dialog-985337" class="x-risu-lb-close-btn">✕</button>
        </div>
        <div class="x-risu-status-container-jaemin">
            <div class="x-risu-status-header-jaemin">에로 스테이터스</div>
            <div class="x-risu-status-content-wrapper-jaemin">
                <div class="x-risu-stats-column-jaemin">
                    <div class="x-risu-stat-box-jaemin">
                        <div class="x-risu-stat-icon-jaemin"><img decoding="async" loading="lazy" style="" alt="/sw/img/6173736574732f363261636233613866353337313831643163343732366165623931303037616132653134353565623033643334666366623266616532376464333963353735662e706e67" src="/sw/img/6173736574732f363261636233613866353337313831643163343732366165623931303037616132653134353565623033643334666366623266616532376464333963353735662e706e67"></div>
                        <div class="x-risu-stat-text-jaemin">
                            <h4>입 (Mouth)</h4>
                            <p><strong>LV:</strong> Lv. 3 (자극)</p>
                            <p class="x-risu-bot-thought">'염병? 하, 이 남자 진짜 대책 없네. 근데 왜 기분이 나쁘지만은 않지?'</p>
                        </div>
                    </div>
                    <div class="x-risu-stat-box-jaemin">
                        <div class="x-risu-stat-icon-jaemin"><img decoding="async" loading="lazy" style="" alt="/sw/img/6173736574732f663534643638363131306365626339396636313965343662666161646534316164333336383533313438396363656434343038646465373535616337356131642e706e67" src="/sw/img/6173736574732f663534643638363131306365626339396636313965343662666161646534316164333336383533313438396363656434343038646465373535616337356131642e706e67"></div>
                        <div class="x-risu-stat-text-jaemin">
                            <h4>가슴 (Breasts)</h4>
                            <p><strong>LV:</strong> Lv. 1 (평온)</p>
                            <p class="x-risu-bot-thought">'실크 블라우스 아래로 심장 박동이 느껴져.'</p>
                        </div>
                    </div>
                    <div class="x-risu-bot-card-jaemin">
                        <div style="background-image: url(/sw/img/6173736574732f353235653066633734313935366564393831393737316537326139373835623034633131326536303230343261376638373536616230623566363837363532662e706e67)" class="x-risu-bot-card-image-jaemin"></div>
                        <div class="x-risu-bot-info-expansion-jaemin">
                            <div class="x-risu-info-line-jaemin"><strong>이름:</strong> <span>서예진</span></div>
                            <div class="x-risu-info-line-jaemin"><strong>칭호:</strong> <span>커리어우먼</span></div>
                            <div class="x-risu-info-line-jaemin"><strong>신분:</strong> <span>유부녀</span></div>
                            <div class="x-risu-info-line-jaemin x-risu-info-line-weakness-jaemin"><strong>약점:</strong> <span>자존심</span></div>
                        </div>
                    </div>
                </div>
                <div class="x-risu-status-main-panel-jaemin">
                    <img decoding="async" loading="lazy" style="" alt="/sw/img/6173736574732f383036386437373237663662393532393131373631373761393731353761313330333731663838356462626137366166356335303631656666383137393763312e706e67" src="/sw/img/6173736574732f383036386437373237663662393532393131373631373761393731353761313330333731663838356462626137366166356335303631656666383137393763312e706e67">
                </div>
                <div class="x-risu-stats-column-jaemin">
                     <div class="x-risu-stat-box-jaemin">
                         <div class="x-risu-stat-icon-jaemin"><img decoding="async" loading="lazy" style="" alt="/sw/img/6173736574732f356139623339653439643238323763323566376135653433623138353865633631313830333633336531616632386437353164323037663964333331653235312e706e67" src="/sw/img/6173736574732f356139623339653439643238323763323566376135653433623138353865633631313830333633336531616632386437353164323037663964333331653235312e706e67"></div>
                         <div class="x-risu-stat-text-jaemin">
                             <h4>젖꼭지 (Nipples)</h4>
                             <p><strong>LV:</strong> Lv. 1 (무감각)</p>
                             <p class="x-risu-bot-thought">'아직은 아무것도.'</p>
                         </div>
                     </div>
                     <div class="x-risu-stat-box-jaemin">
                         <div class="x-risu-stat-icon-jaemin"><img decoding="async" loading="lazy" style="" alt="/sw/img/6173736574732f663033623237643463386336383031343733646134303033636265363061333331363063346237373962323134626134333135633837306530343632383130642e706e67" src="/sw/img/6173736574732f663033623237643463386336383031343733646134303033636265363061333331363063346237373962323134626134333135633837306530343632383130642e706e67"></div>
                         <div class="x-risu-stat-text-jaemin">
                             <h4>자궁 (Uterus)</h4>
                             <p><strong>LV:</strong> Lv. 0 (경험 있음)</p>
                             <p class="x-risu-bot-thought">'아랫배가 아주 미세하게 당기는 기분이야.'</p>
                         </div>
                     </div>
                     <div class="x-risu-stat-box-jaemin">
                         <div class="x-risu-stat-icon-jaemin"><img decoding="async" loading="lazy" style="" alt="/sw/img/6173736574732f363833636436626231656561663738646331306464356438396332306461353533643563623637336335626432306232636237643934646162646538663365652e706e67" src="/sw/img/6173736574732f363833636436626231656561663738646331306464356438396332306461353533643563623637336335626432306232636237643934646162646538663365652e706e67"></div>
                         <div class="x-risu-stat-text-jaemin">
                             <h4>보지 (Pussy)</h4>
                             <p><strong>LV:</strong> Lv. 2 (미열)</p>
                             <p class="x-risu-bot-thought">'조금씩 열이 오르는 것 같아.'</p>
                         </div>
                     </div>
                     <div class="x-risu-stat-box-jaemin">
                         <div class="x-risu-stat-icon-jaemin"><img decoding="async" loading="lazy" style="" alt="/sw/img/6173736574732f393536333663666561393530323162333939643061333332333032326431393263343463313866316531656439343865313835373231313363353737376163622e706e67" src="/sw/img/6173736574732f393536333663666561393530323162333939643061333332333032326431393263343463313866316531656439343865313835373231313363353737376163622e706e67"></div>
                         <div class="x-risu-stat-text-jaemin">
                             <h4>항문 (Anus)</h4>
                             <p><strong>LV:</strong> Lv. 0 (미개척)</p>
                             <p class="x-risu-bot-thought">'엉덩이 근육이 바짝 긴장돼서 딱딱해졌어.'</p>
                         </div>
                     </div>
                     <div class="x-risu-pregnancy-stat-box-jaemin">
                        <div class="x-risu-pregnancy-header-jaemin">
                            <div style="width: 38px; height: 38px;" class="x-risu-stat-icon-jaemin"><img decoding="async" loading="lazy" style="" alt="/sw/img/6173736574732f633035666539613862393435313461633136366330623739373037303235616635303561363337386466343663333538383334303035646436306136616364612e706e67" src="/sw/img/6173736574732f633035666539613862393435313461633136366330623739373037303235616635303561363337386466343663333538383334303035646436306136616364612e706e67"></div>
                            <h4>🤰 임신 현황 (Pregnancy)</h4>
                        </div>
                        <div class="x-risu-pregnancy-details-jaemin">
                            <p><strong>상태:</strong> <span class="x-risu-value">비임신</span></p>
                            <p><strong>주기:</strong> <span class="x-risu-value">해당 없음</span></p>
                            <p><strong>정액:</strong> <span class="x-risu-value">없음</span></p>
                            <p><strong>부:</strong> <span class="x-risu-value">없음</span></p>
                        </div>
                    </div>
                    <div class="x-risu-trait-box-jaemin">
                        <div class="x-risu-trait-header-jaemin"><h4>🔗 성벽/특성</h4></div>
                        <div class="x-risu-trait-text-styled">
                            나르시시스트, 완벽주의자, 유부녀
                        </div>
                    </div>
                </div>
            </div>
            <div class="x-risu-training-stats-row-jaemin">
                <div class="x-risu-training-stat-box-jaemin">
                    <h5>복종도</h5>
                    <div class="x-risu-progress-bar-container-jaemin">
                        <div style="width: 8%;" class="x-risu-progress-bar-fill-jaemin"></div>
                        <div class="x-risu-progress-bar-text-jaemin">8%</div>
                    </div>
                </div>
                <div class="x-risu-training-stat-box-jaemin">
                    <h5>음란도</h5>
                    <div class="x-risu-progress-bar-container-jaemin">
                        <div style="width: 25%;" class="x-risu-progress-bar-fill-jaemin"></div>
                        <div class="x-risu-progress-bar-text-jaemin">25%</div>
                    </div>
                </div>
                <div class="x-risu-training-stat-box-jaemin">
                    <h5>만족도</h5>
                    <div class="x-risu-progress-bar-container-jaemin">
                        <div style="width: 55%;" class="x-risu-progress-bar-fill-jaemin"></div>
                        <div class="x-risu-progress-bar-text-jaemin">55%</div>
                    </div>
                </div>
                <div class="x-risu-training-stat-box-jaemin">
                    <h5>호감도</h5>
                    <div class="x-risu-progress-bar-container-jaemin">
                        <div style="width: 5%;" class="x-risu-progress-bar-fill-jaemin"></div>
                        <div class="x-risu-progress-bar-text-jaemin">5%</div>
                    </div>
                </div>
            </div>
            <div class="x-risu-additional-status-row-jaemin">
                <div class="x-risu-status-text-box-jaemin">
                    <strong>음란도:</strong> <span class="x-risu-status-value">Lv. 1 (경계)</span>
                </div>
                <div class="x-risu-status-text-box-jaemin">
                    <strong>현상태:</strong> <span class="x-risu-status-value">불쾌함과 흥미 사이</span>
                </div>
            </div>
            <div class="x-risu-status-footer-jaemin">
                <span>📅 3월 22일</span> <span>🌤️ 맑음</span> <span>📍 목동의 대형 서점</span>
            </div>
        </div>
    </div>
</div>
<!----></span><!----></span><!----></div></div>`;

      // HTML 파싱
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 헤더 정보 추출
      this.extractHeaderInfo(doc);

      // HTML 콘텐츠 그대로 추출
      const textContent = doc.querySelector('.chattext');

      if (textContent) {
        // p 태그 없이 노출된 텍스트 노드를 p 태그로 감싸기
        this.wrapNakedTextNodes(textContent);
        // 원본 콘텐츠 저장
        this.originalContent = textContent.cloneNode(true);
        // 페이지 분할 (HTML 그대로)
        this.splitIntoPagesHTML(textContent);
      } else {
        // 샘플 텍스트 사용
        this.useSampleText();
      }
    } catch (error) {
      console.error('콘텐츠 로드 실패:', error);
      this.useSampleText();
    }
  }

  /**
   * p 태그 없이 노출된 텍스트 노드를 p 태그로 감싸기
   * @param {HTMLElement} container - 처리할 컨테이너 요소
   */
  wrapNakedTextNodes(container) {
    const childNodes = Array.from(container.childNodes);
    let currentTextGroup = [];

    const flushTextGroup = () => {
      if (currentTextGroup.length === 0) return;

      // 연속된 텍스트 노드들을 하나의 p 태그로 감싸기
      const combinedText = currentTextGroup
        .map(node =>
          node.nodeType === Node.TEXT_NODE ? node.textContent : node.outerHTML,
        )
        .join('');

      // 공백만 있는 경우 무시
      if (combinedText.trim() === '') {
        currentTextGroup.forEach(node => {
          if (node.parentNode) node.parentNode.removeChild(node);
        });
        currentTextGroup = [];
        return;
      }

      // 새 p 태그 생성
      const p = document.createElement('p');
      p.innerHTML = combinedText;

      // 첫 번째 노드 앞에 삽입
      const firstNode = currentTextGroup[0];
      container.insertBefore(p, firstNode);

      // 기존 노드들 제거
      currentTextGroup.forEach(node => {
        if (node.parentNode) node.parentNode.removeChild(node);
      });

      currentTextGroup = [];
    };

    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // 텍스트 노드
        if (node.textContent.trim() !== '') {
          currentTextGroup.push(node);
        } else if (currentTextGroup.length > 0) {
          // 공백 텍스트 노드도 그룹에 포함 (연속성 유지)
          currentTextGroup.push(node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        // 블록 레벨 요소면 현재 그룹 마무리
        const blockElements = [
          'p',
          'div',
          'ul',
          'ol',
          'li',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'table',
          'blockquote',
          'pre',
          'hr',
          'details',
          'figure',
          'section',
          'article',
          'header',
          'footer',
          'nav',
          'aside',
          'title',
        ];

        if (blockElements.includes(tagName)) {
          flushTextGroup();
        } else {
          // 인라인 요소 (mark, span, strong, em, a 등)는 텍스트 그룹에 포함
          currentTextGroup.push(node);
        }
      } else if (node.nodeType === Node.COMMENT_NODE) {
        // 주석 노드는 무시하되 그룹은 유지
      }
    });

    // 남은 텍스트 그룹 처리
    flushTextGroup();
  }

  splitIntoPagesHTML(content) {
    // HTML 요소를 그대로 유지하면서 페이지 분할 (viewport 기반)
    const elements = Array.from(content.children);

    // 임시 측정 컨테이너 생성
    const measureContainer = this.createMeasureContainer();
    document.body.appendChild(measureContainer);

    const availableHeight = measureContainer.clientHeight;
    let currentPageContent = [];

    /**
     * 요소를 페이지에 추가하는 헬퍼 함수
     */
    const addElementToPage = el => {
      const cloned = el.cloneNode(true);
      measureContainer.appendChild(cloned);

      const hasOverflow =
        measureContainer.scrollHeight > measureContainer.clientHeight;

      if (hasOverflow && currentPageContent.length > 0) {
        this.pages.push(this.createPageHTML(currentPageContent));
        currentPageContent = [];
        measureContainer.innerHTML = '';
        measureContainer.appendChild(cloned);
      }

      currentPageContent.push(el);
    };

    elements.forEach(element => {
      // 요소 복제 및 높이 측정
      const clonedElement = element.cloneNode(true);
      measureContainer.innerHTML = '';
      measureContainer.appendChild(clonedElement);

      const elementHeight = measureContainer.scrollHeight;

      // 이미지가 포함된 요소는 별도 페이지로
      if (element.querySelector('img') || element.tagName === 'IMG') {
        if (currentPageContent.length > 0) {
          this.pages.push(this.createPageHTML(currentPageContent));
          currentPageContent = [];
        }
        this.pages.push(this.createPageHTML([element.cloneNode(true)]));
        measureContainer.innerHTML = '';
        return;
      }

      // 현재 페이지 내용과 함께 측정하여 오버플로우 확인
      measureContainer.innerHTML = '';
      currentPageContent.forEach(el => {
        measureContainer.appendChild(el.cloneNode(true));
      });
      measureContainer.appendChild(clonedElement);
      const hasOverflow =
        measureContainer.scrollHeight > measureContainer.clientHeight;

      // 오버플로우 발생하고, 분할 가능한 태그인 경우
      if (hasOverflow && this.textSplitter.isSplittable(element)) {
        // 현재 페이지 먼저 저장
        if (currentPageContent.length > 0) {
          this.pages.push(this.createPageHTML(currentPageContent));
          currentPageContent = [];
        }

        // 요소를 분할하여 각각 처리
        measureContainer.innerHTML = '';
        const splitElements = this.textSplitter.splitElement(
          element,
          measureContainer,
          availableHeight,
        );

        splitElements.forEach(splitEl => {
          addElementToPage(splitEl);
        });

        return;
      }

      // 일반적인 경우 (분할 불가능한 태그)
      if (hasOverflow && currentPageContent.length > 0) {
        this.pages.push(this.createPageHTML(currentPageContent));
        currentPageContent = [];
        measureContainer.innerHTML = '';
        measureContainer.appendChild(clonedElement);
      }

      currentPageContent.push(element.cloneNode(true));
    });

    // 마지막 페이지 추가
    if (currentPageContent.length > 0) {
      this.pages.push(this.createPageHTML(currentPageContent));
    }

    // 측정 컨테이너 제거
    document.body.removeChild(measureContainer);
  }

  createMeasureContainer() {
    // 실제 페이지와 동일한 크기/스타일의 측정용 컨테이너 생성
    const container = document.createElement('div');
    container.className = 'text-content';
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.pointerEvents = 'none';

    // 실제 페이지 콘텐츠와 동일한 크기 적용
    const actualContent =
      this.leftContent || document.querySelector('.left-content');
    if (actualContent) {
      const rect = actualContent.getBoundingClientRect();
      const styles = window.getComputedStyle(actualContent);

      container.style.width = rect.width + 'px';
      container.style.height = rect.height + 'px';
      container.style.padding = styles.padding;
      container.style.fontSize = styles.fontSize;
      container.style.lineHeight = styles.lineHeight;
      container.style.fontFamily = styles.fontFamily;
    }

    return container;
  }

  createPageHTML(elements) {
    // DOM 요소들을 HTML 문자열로 변환
    const div = document.createElement('div');
    elements.forEach(el => div.appendChild(el));
    return div.innerHTML;
  }

  /**
   * 헤더 정보 추출 및 렌더링
   * @param {Document} doc - 파싱된 HTML 문서
   */
  extractHeaderInfo(doc) {
    // 1. 썸네일 추출 (div.shadow-lg.bg-textcolor2.rounded-md)
    const thumbnailEl = doc.querySelector('.shadow-lg.bg-textcolor2.rounded-md');
    if (thumbnailEl && this.headerThumbnail) {
      const style = thumbnailEl.getAttribute('style');
      if (style) {
        // background: url(...) 추출
        const bgMatch = style.match(/background:\s*url\(['"]?([^'")\s]+)['"]?\)/);
        if (bgMatch && bgMatch[1]) {
          this.headerThumbnail.style.backgroundImage = `url('${bgMatch[1]}')`;
        }
      }
    }

    // 2. 채팅명 추출 (div.flexium.items-center.chat-width 내 첫 번째 span)
    const chatWidthEl = doc.querySelector('.flexium.items-center.chat-width');
    if (chatWidthEl && this.headerName) {
      const nameEl = chatWidthEl.querySelector('span.chat-width');
      if (nameEl) {
        this.headerName.textContent = nameEl.textContent.trim();
      }
    }

    // 3. 버튼들 추출 (risu-ebooklike-viewer-chat-message-bot-buttons 내 버튼들)
    const buttonsContainer = doc.querySelector('.risu-ebooklike-viewer-chat-message-bot-buttons');
    if (buttonsContainer && this.headerButtons) {
      // 기존 버튼 제거
      this.headerButtons.innerHTML = '';

      // 주요 버튼들만 복사 (copy, tts, edit, translate)
      const buttonClasses = [
        '.button-icon-copy',
        '.button-icon-tts',
        '.button-icon-edit',
        '.button-icon-translate'
      ];

      buttonClasses.forEach(selector => {
        const btn = buttonsContainer.querySelector(selector);
        if (btn) {
          const clonedBtn = btn.cloneNode(true);
          this.headerButtons.appendChild(clonedBtn);
        }
      });
    }

    // 4. 채팅 인덱스 추출 (div.risu-chat의 data-chat-index)
    const risuChatEl = doc.querySelector('.risu-chat');
    if (risuChatEl && this.headerChatIndex) {
      const chatIndex = risuChatEl.getAttribute('data-chat-index');
      if (chatIndex) {
        // 현재는 총 채팅 수를 알 수 없으므로 인덱스만 표시
        // 실제 구현 시 총 개수는 외부에서 전달받거나 계산해야 함
        const displayIndex = parseInt(chatIndex, 10) + 1; // 0-based to 1-based
        this.headerChatIndex.textContent = `#${displayIndex}`;
      }
    }

    // 5. LB 모듈 수집
    this.collectLBModules(doc);
  }

  /**
   * LB 모듈 수집 및 렌더링
   * x-risu-lb-module-root, x-risu-lb-nai-btn 클래스를 가진 요소 수집
   * @param {Document} doc - 파싱된 HTML 문서
   */
  collectLBModules(doc) {
    const lbModules = [];

    // x-risu-lb-module-root 클래스 요소 수집
    const moduleRoots = doc.querySelectorAll('.x-risu-lb-module-root');
    moduleRoots.forEach(module => {
      const dataId = module.getAttribute('data-id') || '';
      const openerSpan = module.querySelector('.x-risu-lb-opener span');
      const summarySpan = module.querySelector('.x-risu-lb-nai-opener span');
      const label = openerSpan?.textContent?.trim() || summarySpan?.textContent?.trim() || dataId || 'LB Module';

      lbModules.push({
        type: 'module-root',
        dataId: dataId,
        label: label,
        element: module.cloneNode(true)
      });
    });

    // x-risu-lb-nai-btn 클래스 요소 수집 (독립적인 버튼들)
    const naiButtons = doc.querySelectorAll('.x-risu-lb-nai-btn');
    naiButtons.forEach(btn => {
      // 이미 module-root 안에 있는 버튼은 제외 (중복 방지)
      const isInsideModuleRoot = btn.closest('.x-risu-lb-module-root');
      if (!isInsideModuleRoot) {
        const risuBtn = btn.getAttribute('risu-btn') || '';
        const label = btn.textContent?.trim() || risuBtn || 'NAI Button';

        lbModules.push({
          type: 'nai-btn',
          risuBtn: risuBtn,
          label: label,
          element: btn.cloneNode(true)
        });
      }
    });

    // LB 모듈이 있으면 버튼 표시 및 메뉴 렌더링
    if (lbModules.length > 0 && this.lbMenuContainer && this.lbModulesList) {
      this.lbMenuContainer.style.display = 'block';
      this.renderLBModules(lbModules);
    } else if (this.lbMenuContainer) {
      this.lbMenuContainer.style.display = 'none';
    }
  }

  /**
   * LB 모듈 메뉴 렌더링
   * @param {Array} modules - 수집된 LB 모듈 배열
   */
  renderLBModules(modules) {
    if (!this.lbModulesList) return;

    this.lbModulesList.innerHTML = '';

    modules.forEach((module, index) => {
      const item = document.createElement('div');
      item.className = 'lb-module-item';

      const labelSpan = document.createElement('span');
      labelSpan.className = 'lb-module-label';
      // 이모지 등 특수문자 보존을 위해 textContent가 아닌 innerHTML 사용은 위험하므로
      // 간단한 텍스트 정리만 수행
      labelSpan.textContent = module.label.replace(/\s+/g, ' ').substring(0, 30);

      item.appendChild(labelSpan);

      // 클릭 시 해당 모듈로 이동하는 기능 (페이지에서 해당 요소 찾기)
      item.addEventListener('click', () => {
        this.scrollToLBModule(module.dataId || module.risuBtn);
        this.closeLBMenu();
      });

      this.lbModulesList.appendChild(item);
    });
  }

  /**
   * LB 모듈로 스크롤 (페이지에서 해당 요소 찾기)
   * @param {string} identifier - 모듈 식별자 (data-id 또는 risu-btn)
   */
  scrollToLBModule(identifier) {
    // 현재 페이지들에서 해당 모듈을 포함하는 페이지 찾기
    for (let i = 0; i < this.pages.length; i++) {
      const pageContent = this.pages[i];
      if (pageContent.includes(`data-id="${identifier}"`) ||
          pageContent.includes(`risu-btn="${identifier}"`)) {
        // 해당 페이지로 이동 (2페이지씩 표시)
        this.currentPage = Math.floor(i / 2);
        this.renderPage();
        break;
      }
    }
  }

  useSampleText() {
    // 샘플 텍스트 (message-area1.html의 일부)
    this.pages = [
      `
            <h2>ALTERNATE HUNTERS</h2>
            <p>최유진의 눈썹이 미세하게 꿈틀거렸다. 그 움직임은 찰나에 가까웠지만 완벽하게 통제된 그녀의 표정 위에서는 지진처럼 선명했다. 그녀는 들고 있던 펜을 태블릿 옆에 조용히 내려놓았다. 플라스틱이 부딪히는 소리가 유난히 크게 들렸다.</p>
            <p><mark>"성함 김한결. 스물넷, 남성입니다."</mark></p>
            <p>내 목소리가 로비의 소음에 섞여 들어갔다. 최유진의 시선이 내 얼굴에 고정되었다. 그녀는 아무 말 없이 고개를 살짝 끄덕이며 다시 펜을 들어 태블릿에 무언가를 빠르게 입력하기 시작했다.</p>
            `,
      `
            <p><mark>"각성일은… 어제 저녁. 시간은 정확히 기억나지 않습니다. 스킬은 아직 없습니다."</mark></p>
            <p><mark>"알겠습니다 김한결 헌터 님."</mark></p>
            <p>그녀는 나를 '헌터'라고 불렀다. 그 호칭은 아직 몸에 맞지 않는 옷처럼 어색했다. 그녀는 입력을 마치고는 자리에서 일어나 옆에 있는 문을 가리켰다. 문 위에는 '등급 측정실'이라는 명패가 붙어 있었다.</p>
            `,
      `
            <p><mark>"정보 확인되었습니다. 이쪽으로 이동하시면 측정 담당관이 안내해 드릴 겁니다. 소지품은 모두 보관함에 넣어주시고 몸만 들어가시면 됩니다."</mark></p>
            <p>그녀의 목소리는 다시 완벽한 사무톤으로 돌아와 있었다. 아까의 작은 균열은 말끔히 메워진 듯했다. 내가 고개를 끄덕이고 몸을 돌리려 할 때 로비 한쪽에서 소란스러운 목소리가 터져 나왔다.</p>
            `,
      `
            <p><mark>"그러니까! 서류가 복잡한 건 알겠는데, 이걸 다 신입한테 맡기면 어떡해? 애 잡겠다 애 잡아!"</mark></p>
            <p>고개를 돌리자 시야에 강렬한 진홍색이 들어왔다. 긴 머리를 아무렇게나 높게 묶은 여자가 팔짱을 낀 채 서 있었다. 검은 탱크톱 위로 걸친 붉은 가죽 재킷이 유난히 눈에 띄었다.</p>
            `,
      `
            <p>측정실로 향하는 복도는 로비와는 달리 조용하고 서늘했다. 몇 걸음 옮기지 않아, 복도 한쪽에 마련된 대기용 벤치에 앉아 있는 사람이 눈에 들어왔다. 푸른색 단발머리의 여자였다. 그녀는 눈을 감고 정좌 자세로 앉아 있었다.</p>
            <p>마치 주변의 모든 소음과 분리된 자신만의 공간에 있는 것처럼 보였다. 그녀의 무릎 위에는 아무런 장식도 없는 검집에 담긴 칼이 놓여 있었다.</p>
            `,
      `
            <p>나는 직원의 안내에 따라 휴대전화와 지갑을 작은 보관함에 넣었다. 텅 빈 몸으로 측정실의 육중한 문 앞에 섰다. 문이 열리자 안쪽은 예상보다 훨씬 넓은 돔 형태의 공간이었다.</p>
            <p>중앙에는 복잡한 문양이 새겨진 원형 판이 있었고 벽면은 알 수 없는 재질의 금속으로 마감되어 있었다.</p>
            `,
    ];
  }

  renderPage() {
    if (this.pages.length === 0) return;

    // 페이지 인덱스 계산 (2페이지씩 표시)
    const leftIndex = this.currentPage * 2;
    const rightIndex = this.currentPage * 2 + 1;

    // 콘텐츠 설정
    this.leftContent.innerHTML = this.pages[leftIndex] || '';
    this.rightContent.innerHTML = this.pages[rightIndex] || '';

    // 페이지 번호 설정
    if (this.pages[leftIndex]) {
      this.leftPageNum.textContent = leftIndex + 1;
    } else {
      this.leftPageNum.textContent = '';
    }

    if (this.pages[rightIndex]) {
      this.rightPageNum.textContent = rightIndex + 1;
    } else {
      this.rightPageNum.textContent = '';
    }

    // 페이지 인디케이터 업데이트
    const totalSpread = Math.ceil(this.pages.length / 2);
    this.pageIndicator.textContent = `${this.currentPage + 1} / ${totalSpread}`;

    // 버튼 상태 업데이트
    this.prevBtn.disabled = this.currentPage === 0;
    this.nextBtn.disabled = rightIndex >= this.pages.length - 1;
  }

  nextPage() {
    const rightIndex = this.currentPage * 2 + 1;
    if (rightIndex >= this.pages.length - 1) return;

    this.currentPage++;
    this.renderPage();
  }

  prevPage() {
    if (this.currentPage === 0) return;

    this.currentPage--;
    this.renderPage();
  }

  attachEventListeners() {
    // 버튼 클릭
    this.nextBtn.addEventListener('click', () => this.nextPage());
    this.prevBtn.addEventListener('click', () => this.prevPage());

    // 클릭 영역
    this.clickLeft.addEventListener('click', () => this.prevPage());
    this.clickRight.addEventListener('click', () => this.nextPage());

    // 키보드 네비게이션
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prevPage();
      }
    });

    // 설정 드롭다운 토글
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSettingsMenu();
      });
    }

    // LB 메뉴 토글
    if (this.lbBtn) {
      this.lbBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLBMenu();
      });
    }

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      // 설정 메뉴 닫기
      if (this.settingsMenu && !this.settingsMenuContainer?.contains(e.target)) {
        this.closeSettingsMenu();
      }
      // LB 메뉴 닫기
      if (this.lbMenu && !this.lbMenuContainer?.contains(e.target)) {
        this.closeLBMenu();
      }
    });

    // 사용자 CSS 모달 이벤트
    if (this.openCustomCssBtn) {
      this.openCustomCssBtn.addEventListener('click', () => {
        this.openCustomCssModal();
      });
    }

    if (this.closeCustomCssBtn) {
      this.closeCustomCssBtn.addEventListener('click', () => {
        this.closeCustomCssModal();
      });
    }

    if (this.applyCustomCssBtn) {
      this.applyCustomCssBtn.addEventListener('click', () => {
        this.applyCustomCss();
      });
    }

    if (this.resetCustomCssBtn) {
      this.resetCustomCssBtn.addEventListener('click', () => {
        this.resetCustomCss();
      });
    }

    // 모달 배경 클릭 시 닫기
    if (this.customCssModal) {
      this.customCssModal.addEventListener('click', (e) => {
        if (e.target === this.customCssModal) {
          this.closeCustomCssModal();
        }
      });
    }

    // ESC 키로 모달/드롭다운 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSettingsMenu();
        this.closeLBMenu();
        this.closeCustomCssModal();
      }
    });

    // 폰트 크기 조절
    this.fontSizeInput.addEventListener('input', e => {
      const size = e.target.value;
      document.documentElement.style.setProperty('--font-size', `${size}px`);
      document.getElementById('fontSizeValue').textContent = `${size}px`;
      this.saveSettings();
      this.debouncedRepaginate();
    });

    // 줄 간격 조절
    this.lineHeightInput.addEventListener('input', e => {
      const height = e.target.value;
      document.documentElement.style.setProperty('--line-height', height);
      document.getElementById('lineHeightValue').textContent = height;
      this.saveSettings();
      this.debouncedRepaginate();
    });

    // 윈도우 리사이즈 시 페이지 재분할
    window.addEventListener('resize', () => {
      this.debouncedRepaginate();
    });

    // 테마 변경
    this.themeSelect.addEventListener('change', e => {
      document.body.setAttribute('data-theme', e.target.value);
      this.saveSettings();
    });
  }

  debouncedRepaginate() {
    // 디바운스: 짧은 시간 내 여러 번 호출되어도 마지막 한 번만 실행
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.repaginate();
    }, 300);
  }

  async repaginate() {
    // 원본 콘텐츠가 없으면 재분할 불가
    if (!this.originalContent) return;

    // 레이아웃이 완전히 계산될 때까지 대기
    await this.waitForLayout();

    // 현재 페이지 위치 저장 (첫 번째 페이지의 인덱스)
    const currentFirstPage = this.currentPage * 2;

    // 페이지 초기화
    this.pages = [];
    this.currentPage = 0;

    // 페이지 재분할
    this.splitIntoPagesHTML(this.originalContent);

    // 가능한 한 이전 페이지 위치로 복원 (최대 페이지 수 제한)
    const maxPage = Math.max(0, Math.ceil(this.pages.length / 2) - 1);
    this.currentPage = Math.min(Math.floor(currentFirstPage / 2), maxPage);

    // 페이지 렌더링
    this.renderPage();
  }

  // ===== 드롭다운 메뉴 토글 =====

  toggleSettingsMenu() {
    if (this.settingsMenu) {
      const isActive = this.settingsMenu.classList.contains('active');
      this.closeAllDropdowns();
      if (!isActive) {
        this.settingsMenu.classList.add('active');
      }
    }
  }

  closeSettingsMenu() {
    if (this.settingsMenu) {
      this.settingsMenu.classList.remove('active');
    }
  }

  toggleLBMenu() {
    if (this.lbMenu) {
      const isActive = this.lbMenu.classList.contains('active');
      this.closeAllDropdowns();
      if (!isActive) {
        this.lbMenu.classList.add('active');
      }
    }
  }

  closeLBMenu() {
    if (this.lbMenu) {
      this.lbMenu.classList.remove('active');
    }
  }

  closeAllDropdowns() {
    this.closeSettingsMenu();
    this.closeLBMenu();
  }

  // ===== 사용자 CSS 모달 =====

  openCustomCssModal() {
    if (this.customCssModal) {
      this.customCssModal.classList.add('active');
      this.closeSettingsMenu();
    }
  }

  closeCustomCssModal() {
    if (this.customCssModal) {
      this.customCssModal.classList.remove('active');
    }
  }

  applyCustomCss() {
    if (!this.customCssInput) return;

    const css = this.customCssInput.value.trim();

    // 기존 스타일 요소 제거
    if (this.customStyleElement) {
      this.customStyleElement.remove();
    }

    // 새 스타일 요소 생성 및 적용
    if (css) {
      this.customStyleElement = document.createElement('style');
      this.customStyleElement.id = 'custom-user-css';
      this.customStyleElement.textContent = css;
      document.head.appendChild(this.customStyleElement);
    }

    // localStorage에 저장
    this.saveCustomCss(css);

    // 모달 닫기
    this.closeCustomCssModal();

    // 페이지 재분할 (CSS 변경으로 레이아웃이 변경될 수 있음)
    this.debouncedRepaginate();
  }

  resetCustomCss() {
    if (this.customCssInput) {
      this.customCssInput.value = '';
    }

    // 기존 스타일 요소 제거
    if (this.customStyleElement) {
      this.customStyleElement.remove();
      this.customStyleElement = null;
    }

    // localStorage에서 삭제
    localStorage.removeItem('bookViewerCustomCss');

    // 페이지 재분할
    this.debouncedRepaginate();
  }

  saveCustomCss(css) {
    localStorage.setItem('bookViewerCustomCss', css);
  }

  loadCustomCss() {
    const savedCss = localStorage.getItem('bookViewerCustomCss');
    if (savedCss && this.customCssInput) {
      this.customCssInput.value = savedCss;

      // 스타일 적용
      this.customStyleElement = document.createElement('style');
      this.customStyleElement.id = 'custom-user-css';
      this.customStyleElement.textContent = savedCss;
      document.head.appendChild(this.customStyleElement);
    }
  }

  // ===== 설정 저장/로드 =====

  saveSettings() {
    const settings = {
      fontSize: this.fontSizeInput.value,
      lineHeight: this.lineHeightInput.value,
      theme: this.themeSelect.value,
    };
    localStorage.setItem('bookViewerSettings', JSON.stringify(settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('bookViewerSettings');
    if (!saved) return;

    try {
      const settings = JSON.parse(saved);

      if (settings.fontSize) {
        this.fontSizeInput.value = settings.fontSize;
        document.documentElement.style.setProperty(
          '--font-size',
          `${settings.fontSize}px`,
        );
        document.getElementById('fontSizeValue').textContent =
          `${settings.fontSize}px`;
      }

      if (settings.lineHeight) {
        this.lineHeightInput.value = settings.lineHeight;
        document.documentElement.style.setProperty(
          '--line-height',
          settings.lineHeight,
        );
        document.getElementById('lineHeightValue').textContent =
          settings.lineHeight;
      }

      if (settings.theme) {
        this.themeSelect.value = settings.theme;
        document.body.setAttribute('data-theme', settings.theme);
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  new BookViewer();
});
