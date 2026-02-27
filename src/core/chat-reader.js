import { RisuAPI } from './risu-api.js';
import { LOCATOR } from '../utils/selector.js';

function getSafeAttribute(element, name) {
  if (!element) {
    return null;
  }

  if (typeof element.getAttribute === 'function') {
    return element.getAttribute(name);
  }

  if (Object.prototype.hasOwnProperty.call(element, name)) {
    return element[name];
  }

  return null;
}

function getSafeText(element, methodName, propertyName) {
  if (!element) {
    return null;
  }

  if (typeof element[methodName] === 'function') {
    try {
      return element[methodName]();
    } catch {
      return null;
    }
  }

  return element[propertyName] ?? null;
}

function hasSafeClass(element, className) {
  if (!element || !className) {
    return false;
  }

  if (typeof element.hasClass === 'function') {
    return element.hasClass(className);
  }

  const classAttr = getSafeAttribute(element, 'class');
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

function readMessageIndex(element) {
  const candidates = [
    getSafeAttribute(element, 'data-chat-index'),
    getSafeAttribute(element, 'data-index'),
    getSafeAttribute(element, 'data-message-index'),
  ];

  const matched = candidates.find(value => parseIndex(value) != null);
  if (matched != null) {
    return parseIndex(matched);
  }

  const classAttr = getSafeAttribute(element, 'class');
  const classMatch = String(classAttr || '').match(/chat-index-(\d+)/i);
  if (classMatch) {
    return parseIndex(classMatch[1]);
  }

  const idAttr = getSafeAttribute(element, 'id');
  const idMatch = String(idAttr || '').match(/-(\d+)$/);
  if (idMatch) {
    return parseIndex(idMatch[1]);
  }

  return null;
}

function readMessageRole(element) {
  const roleFromAttribute =
    getSafeAttribute(element, 'data-role') ||
    getSafeAttribute(element, 'role') ||
    getSafeAttribute(element, 'data-chat-role') ||
    getSafeAttribute(element, 'data-sender');

  const normalizedRole = String(roleFromAttribute || '').toLowerCase();
  if (normalizedRole === 'user') {
    return 'user';
  }

  if (normalizedRole === 'assistant' || normalizedRole === 'char') {
    return 'assistant';
  }

  if (hasSafeClass(element, 'user') || hasSafeClass(element, 'user-message')) {
    return 'user';
  }

  if (
    hasSafeClass(element, 'assistant') ||
    hasSafeClass(element, 'assistant-message') ||
    hasSafeClass(element, 'char')
  ) {
    return 'assistant';
  }

  return 'assistant';
}

function getChatMessageElements(rootDoc) {
  if (!rootDoc || typeof rootDoc.querySelectorAll !== 'function') {
    return [];
  }

  const selectors = [
    ...(LOCATOR.chatMessage?.root?.cssClass ?? []),
    LOCATOR.chatMessage?.root?.className
      ? `.${LOCATOR.chatMessage.root.className}`
      : null,
  ];

  const chatSelectorHint =
    LOCATOR.chatMessage?.root?.cssClass?.[0] ?? '.chat-selector';
  try {
    rootDoc.querySelector(chatSelectorHint);
  } catch {}

  const seen = new Set();
  const elements = [];

  selectors.forEach(selector => {
    if (!selector) {
      return;
    }

    const safeSelector = selector.trim();
    if (safeSelector === '') {
      return;
    }

    try {
      const matched = rootDoc.querySelectorAll(safeSelector);
      matched.forEach(node => {
        if (!seen.has(node)) {
          seen.add(node);
          elements.push(node);
        }
      });
    } catch {
      return;
    }
  });

  return elements;
}

export function readChatMessages() {
  let rootDoc = null;
  try {
    rootDoc = risuai.getRootDocument();
  } catch {
    return [];
  }

  return getChatMessageElements(rootDoc)
    .map(element => {
      const html =
        typeof element.getInnerHTML === 'function'
          ? element.getInnerHTML()
          : getSafeText(element, 'getInnerHTML', 'outerHTML') || '';

      return {
        role: readMessageRole(element),
        html,
        index: readMessageIndex(element),
      };
    })
    .filter(item => item.html != null);
}

export function subscribeToChatChanges(callback) {
  if (typeof callback !== 'function') {
    return () => {};
  }

  let rootDoc = null;
  try {
    rootDoc = risuai.getRootDocument();
  } catch {
    return () => {};
  }
  const rootBody =
    typeof rootDoc?.querySelector === 'function'
      ? rootDoc.querySelector('body')
      : null;

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
        callback(readChatMessages());
      }
    }, 0);
  };

  void (async () => {
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

    observer.observe(rootBody, {
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

export function getCurrentChatIndex() {
  const messages = readChatMessages();
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
