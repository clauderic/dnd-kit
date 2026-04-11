import * as React from 'react';
import type { UIMessage } from '@ai-sdk/react';
import { cn } from '../../lib/cn';

interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: UIMessage;
}

export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ className, message, ...props }, ref) => {
    const content = message.parts
      .filter((p) => p.type === 'text')
      .map((p) => ('text' in p ? p.text : ''))
      .join('');

    return (
      <div className="flex justify-end items-end w-full flex-col gap-2">
        <div
          ref={ref}
          className={cn(
            'flex px-3 py-2 items-start gap-4 w-fit rounded-2xl bg-gray-100 dark:bg-white/10',
            className,
          )}
          {...props}
        >
          <div className="flex items-start gap-4 w-full">
            <div className="flex flex-col gap-1 w-full">
              <div className="wrap-break-word hyphens-auto text-base lg:text-sm text-gray-800 dark:text-gray-200">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
ChatMessage.displayName = 'ChatMessage';
