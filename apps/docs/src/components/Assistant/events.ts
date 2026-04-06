export const ASSISTANT_EVENTS = {
  TOGGLE: 'assistant:toggle',
  OPEN: 'assistant:open',
  CLOSE: 'assistant:close',
} as const;

export function toggleAssistant() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_EVENTS.TOGGLE));
}

export interface CodeContext {
  code: string;
  language?: string;
}

export function openAssistant(codeContext?: CodeContext) {
  window.dispatchEvent(new CustomEvent(ASSISTANT_EVENTS.OPEN, { detail: { codeContext } }));
}

export function closeAssistant() {
  window.dispatchEvent(new CustomEvent(ASSISTANT_EVENTS.CLOSE));
}
