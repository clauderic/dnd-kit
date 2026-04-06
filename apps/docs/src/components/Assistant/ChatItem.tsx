import * as React from 'react';
import type { UIMessage } from '@ai-sdk/react';
import { ChatMessage } from './ChatMessage';
import { ChatResponse } from './ChatResponse';

interface ChatItemProps extends React.HTMLAttributes<HTMLDivElement> {
  message: UIMessage;
  isLast?: boolean;
  hasError?: boolean;
  onRegenerate?: () => void;
}

export function ChatItem({ message, isLast, hasError, onRegenerate }: ChatItemProps) {
  if (message.role === 'user') {
    return <ChatMessage message={message} />;
  }

  if (message.role === 'assistant') {
    return (
      <ChatResponse message={message} isLast={isLast} hasError={hasError} onRegenerate={onRegenerate} />
    );
  }

  return null;
}
