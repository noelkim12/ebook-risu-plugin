import { RisuAPI } from './risu-api.js';
import { LOCATOR } from '../utils/selector.js';

async function getSafeAttribute(element, name) {
  if (!element) {
    return null;
  }

  if (typeof element.getAttribute === 'function') {
    return await element.getAttribute(name);
  }

  if (Object.prototype.hasOwnProperty.call(element, name)) {
    return element[name];
  }

  return null;
}

async function getSafeText(element, methodName, propertyName) {
  if (!element) {
    return null;
  }

  if (typeof element[methodName] === 'function') {
    try {
      return await element[methodName]();
    } catch {
      return null;
    }
  }

  return element[propertyName] ?? null;
}

async function hasSafeClass(element, className) {
  if (!element || !className) {
    return false;
  }

  if (typeof element.hasClass === 'function') {
    return await element.hasClass(className);
  }

  const classAttr = await getSafeAttribute(element, 'class');
  return String(classAttr || '')
    .split(/\s+/)
    .includes(className);
}

function parseIndex(rawIndex) {
  if (rawIndex == null) {
    return null;
  }

  const parsed = parseInt(String(rawIndex), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function readMessageIndex(element) {
  const candidates = [
    await getSafeAttribute(element, 'data-chat-index'),
    await getSafeAttribute(element, 'data-index'),
    await getSafeAttribute(element, 'data-message-index'),
  ];

  const matched = candidates.find(value => parseIndex(value) != null);
  if (matched != null) {
    return parseIndex(matched);
  }

  const classAttr = await getSafeAttribute(element, 'class');
  const classMatch = String(classAttr || '').match(/chat-index-(\d+)/i);
  if (classMatch) {
    return parseIndex(classMatch[1]);
  }

  const idAttr = await getSafeAttribute(element, 'id');
  const idMatch = String(idAttr || '').match(/-(\d+)$/);
  if (idMatch) {
    return parseIndex(idMatch[1]);
  }

  return null;
}

async function readMessageRole(element) {
  const roleFromAttribute =
    (await getSafeAttribute(element, 'data-role')) ||
    (await getSafeAttribute(element, 'role')) ||
    (await getSafeAttribute(element, 'data-chat-role')) ||
    (await getSafeAttribute(element, 'data-sender'));

  const normalizedRole = String(roleFromAttribute || '').toLowerCase();
  if (normalizedRole === 'user') {
    return 'user';
  }

  if (normalizedRole === 'assistant' || normalizedRole === 'char') {
    return 'assistant';
  }

  if (
    (await hasSafeClass(element, 'user')) ||
    (await hasSafeClass(element, 'user-message'))
  ) {
    return 'user';
  }

  if (
    (await hasSafeClass(element, 'assistant')) ||
    (await hasSafeClass(element, 'assistant-message')) ||
    (await hasSafeClass(element, 'char'))
  ) {
    return 'assistant';
  }

  return 'assistant';
}

async function getChatMessageElements(rootDoc) {
  console.log('[chat-reader] getChatMessageElements called, rootDoc valid:', !!rootDoc);
  if (!rootDoc || typeof rootDoc.querySelectorAll !== 'function') {
    console.log('[chat-reader] rootDoc invalid or querySelectorAll not available');
    return [];
  }

  const selectors = [
    ...(LOCATOR.chatMessage?.root?.cssClass ?? []),
    LOCATOR.chatMessage?.root?.className
      ? `.${LOCATOR.chatMessage.root.className}`
      : null,
  ];

  console.log('[chat-reader] Selectors to use:', selectors.filter(Boolean));

  const seen = new Set();
  const elements = [];

  for (const selector of selectors) {
    if (!selector) {
      continue;
    }

    const safeSelector = selector.trim();
    if (safeSelector === '') {
      continue;
    }

    try {
      console.log('[chat-reader] Trying selector:', safeSelector);
      const matched = await rootDoc.querySelectorAll(safeSelector);
      
      // v3 API: querySelectorAll returns SafeClassArray, need to unwrap
      let elementArray = matched;
      if (matched && typeof matched.length === 'function') {
        // SafeClassArray detected - use unwarpSafeArray
        console.log('[chat-reader] Detected SafeClassArray, unwrapping...');
        elementArray = await risuai.unwarpSafeArray(matched);
      }
      
      console.log('[chat-reader] Selector', safeSelector, 'found', elementArray.length, 'elements');
      
      // Check first element to see available methods
      if (elementArray.length > 0) {
        const firstEl = elementArray[0];
        console.log('[chat-reader] First element type:', typeof firstEl, 'keys:', Object.keys(firstEl || {}).slice(0, 10));
        console.log('[chat-reader] First element methods:', {
          getInnerHTML: typeof firstEl?.getInnerHTML,
          getOuterHTML: typeof firstEl?.getOuterHTML,
          innerText: typeof firstEl?.innerText,
          getClassName: typeof firstEl?.getClassName,
        });
      }
      
      elementArray.forEach(node => {
        if (!seen.has(node)) {
          seen.add(node);
          elements.push(node);
        }
      });
    } catch (e) {
      console.error('[chat-reader] Selector failed:', safeSelector, e);
      continue;
    }
  }

  console.log('[chat-reader] Total unique elements found:', elements.length);
  return elements;
}

export async function readChatMessages() {
  console.log('[chat-reader] readChatMessages called');
  let rootDoc = null;
  try {
    rootDoc = await risuai.getRootDocument();
    console.log('[chat-reader] Got rootDoc:', !!rootDoc, 'type:', typeof rootDoc);
  } catch (e) {
    console.error('[chat-reader] Failed to get rootDoc:', e);
    return [];
  }

  console.log('[chat-reader] Getting chat elements...');
  const elements = await getChatMessageElements(rootDoc);
  console.log('[chat-reader] Found', elements.length, 'chat elements');

  if (elements.length === 0) {
    console.log('[chat-reader] No elements found, returning empty array');
    return [];
  }

  const messages = await Promise.all(
    elements.map(async (element, idx) => {
      let html = '';
      let outerHtml = '';
      
      // 디버그: Proxy 요소인지 확인하고 직접 호출 시도
      if (idx < 3) {
        console.log('[chat-reader] Element', idx, '__classType:', element.__classType);
        
        // Proxy의 경우 typeof가 'function'을 반환하지 않을 수 있음
        // 직접 호출해서 작동하는지 확인
        try {
          const testHtml = await element.getInnerHTML();
          console.log('[chat-reader] Element', idx, 'DIRECT getInnerHTML() =>', testHtml?.length || 0, 'chars');
          if (testHtml) html = testHtml;
        } catch (e) {
          console.log('[chat-reader] Element', idx, 'DIRECT getInnerHTML() error:', e.message || e);
        }
        
        try {
          const testOuter = await element.getOuterHTML();
          console.log('[chat-reader] Element', idx, 'DIRECT getOuterHTML() =>', testOuter?.length || 0, 'chars');
          if (testOuter) outerHtml = testOuter;
        } catch (e) {
          console.log('[chat-reader] Element', idx, 'DIRECT getOuterHTML() error:', e.message || e);
        }
        
        try {
          const className = await element.getClassName();
          console.log('[chat-reader] Element', idx, 'DIRECT getClassName() =>', className?.substring?.(0, 100) || className);
        } catch (e) {
          console.log('[chat-reader] Element', idx, 'DIRECT getClassName() error:', e.message || e);
        }
      } else {
        // idx >= 3 인 경우: 직접 호출 (typeof 체크 없이)
        try {
          html = await element.getInnerHTML();
        } catch (e) {
          // ignore
        }
        
        if (!html) {
          try {
            outerHtml = await element.getOuterHTML();
          } catch (e) {
            // ignore
          }
        }
      }

      const role = await readMessageRole(element);
      const index = await readMessageIndex(element);
      
      // outerHTML 사용 (inner가 비어있으면)
      const finalHtml = html || outerHtml || '';

      if (idx < 3) {
        console.log('[chat-reader] Message', idx, ':', 'role=', role, 'index=', index, 'finalHtmlLen=', finalHtml?.length || 0);
      }

      return {
        role,
        html: finalHtml,
        index,
      };
    }),
  );

  const filtered = messages.filter(item => item.html != null);
  console.log('[chat-reader] Returning', filtered.length, 'messages');
  return filtered;
}

export function subscribeToChatChanges(callback) {
  if (typeof callback !== 'function') {
    return () => {};
  }

  const api = RisuAPI.getInstance();
  let observer = null;
  let disposed = false;
  let timerId = null;

  const notify = () => {
    if (disposed) {
      return;
    }
    if (timerId != null) {
      return;
    }

    timerId = setTimeout(() => {
      timerId = null;
      if (!disposed) {
        void readChatMessages().then(messages => {
          if (!disposed) {
            callback(messages);
          }
        });
      }
    }, 0);
  };

  void (async () => {
    let rootDoc = null;
    try {
      rootDoc = await risuai.getRootDocument();
    } catch {
      notify();
      return;
    }

    const rootBody =
      typeof rootDoc?.querySelector === 'function'
        ? await rootDoc.querySelector('body')
        : null;

    observer = await api.createMutationObserver(() => {
      notify();
    });

    if (disposed) {
      observer.disconnect();
      return;
    }

    if (!rootBody || typeof observer.observe !== 'function') {
      notify();
      return;
    }

    await observer.observe(rootBody, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    notify();
  })();

  return () => {
    disposed = true;
    if (timerId != null) {
      clearTimeout(timerId);
      timerId = null;
    }
    if (observer && typeof observer.disconnect === 'function') {
      observer.disconnect();
    }
    observer = null;
  };
}

export async function getCurrentChatIndex() {
  const messages = await readChatMessages();
  let current = null;
  for (const message of messages) {
    if (message.index == null) {
      continue;
    }
    if (current == null || message.index > current) {
      current = message.index;
    }
  }
  return current;
}
