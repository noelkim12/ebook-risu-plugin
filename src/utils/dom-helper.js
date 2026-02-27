export function findButtons(container, selector = 'button, [role="button"]') {
  if (!container) return [];

  return Array.from(container.querySelectorAll(selector));
}

export function cloneButtonsWithEventDelegation(
  buttons,
  container,
  options = {},
) {
  if (!container || !buttons?.length) return [];

  return [...buttons].filter(button => button instanceof HTMLElement);
}

export function delegateButtonEvents(container, originalButtons, options = {}) {
  if (!container || !originalButtons?.length) return;
  return;
}
