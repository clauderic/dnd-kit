import { useMemo } from 'react';
import type { UIMessage } from '@ai-sdk/react';
import { ChatItem } from './ChatItem';

interface AssistantHistoryListProps {
  messages: UIMessage[];
  status: 'ready' | 'streaming' | 'submitted' | 'error';
}

const hasVisibleParts = (parts: UIMessage['parts'] | undefined) =>
  parts?.some((part) => part.type === 'text' || part.type === 'tool-search') ??
  false;

function LoadingIndicator() {
  return (
    <div className="flex gap-0.5 items-end h-3 py-2 mb-4">
      <span className="size-1 bg-zinc-400 rounded-full animate-dot-bounce" />
      <span className="size-1 bg-zinc-400 rounded-full animate-dot-bounce [animation-delay:0.2s]" />
      <span className="size-1 bg-zinc-400 rounded-full animate-dot-bounce [animation-delay:0.4s]" />
    </div>
  );
}

export function AssistantHistoryList({
  messages,
  status,
}: AssistantHistoryListProps) {
  const isLoading = useMemo(() => {
    if (status === 'submitted') return true;
    if (status !== 'streaming') return false;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return false;
    if (lastMessage.role === 'user') return true;

    const lastPart = lastMessage.parts[lastMessage.parts.length - 1];
    return lastPart?.type !== 'text' || !lastPart.text;
  }, [status, messages]);

  const visibleMessages = messages.filter(
    (msg) =>
      msg.role !== 'system' &&
      (msg.role !== 'assistant' || hasVisibleParts(msg.parts)),
  );

  return (
    <div className="space-y-4">
      {visibleMessages.map((msg, index) => (
        <ChatItem
          key={msg.id}
          message={msg}
          isLast={index === visibleMessages.length - 1}
        />
      ))}
      {isLoading && <LoadingIndicator />}
    </div>
  );
}
