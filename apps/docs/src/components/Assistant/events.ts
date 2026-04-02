export const ASSISTANT_EVENTS = {
  TOGGLE: 'assistant:toggle',
  OPEN: 'assistant:open',
  CLOSE: 'assistant:close',
} as const;

export function toggleAssistant() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_EVENTS.TOGGLE));
}

export function openAssistant() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_EVENTS.OPEN));
}

export function closeAssistant() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_EVENTS.CLOSE));
}
