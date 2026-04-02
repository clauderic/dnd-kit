import * as React from 'react';
import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn, Icon } from '@mintlify/components';
import type { UIMessage } from '@ai-sdk/react';

interface ChatResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  message: UIMessage;
  isLast?: boolean;
  hasError?: boolean;
}

const normalizePath = (path: string | undefined): string => {
  if (!path) return '/';

  let normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.endsWith('index')) {
    normalized = normalized.replace('index', '');
  }
  return normalized;
};

const isLocalUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  return (
    !url.startsWith('http://') &&
    !url.startsWith('https://') &&
    !url.startsWith('//')
  );
};

const CopyButtonClassName =
  'rounded-lg p-1.5 hover:bg-gray-100 cursor-pointer text-gray-500';

const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <button
      className={CopyButtonClassName}
      onClick={handleCopy}
      aria-label="Copy response"
    >
      {copied ? (
        <Icon icon="check" iconLibrary="lucide" color="green" size={16} />
      ) : (
        <Icon icon="copy" iconLibrary="lucide" color="dimgray" size={16} />
      )}
    </button>
  );
};

const ShimmerText = ({ children }: { children: React.ReactNode }) => (
  <>
    <span
      className="animate-shimmer bg-size-[200%_100%] bg-clip-text text-transparent font-medium"
      style={{
        backgroundImage:
          'linear-gradient(90deg, rgb(156 163 175) 0%, rgb(209 213 219) 50%, rgb(156 163 175) 100%)',
      }}
    >
      {children}
    </span>
    <style>{`
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite linear;
      }
    `}</style>
  </>
);

const SearchingContainer = ({
  query,
  children,
}: {
  query: string;
  children?: React.ReactNode;
}) => {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const hasResults = children != null;

  return (
    <>
      <button
        className={cn(
          'group flex items-center text-left gap-2.5 text-gray-500 shrink-0 hover:text-gray-600 transition-colors',
          hasResults ? 'cursor-pointer' : 'cursor-default',
        )}
        onClick={() => {
          if (!hasResults) return;
          setIsSourcesOpen(!isSourcesOpen);
        }}
      >
        {!isSourcesOpen && (
          <span className="shrink-0 group-hover:hidden">
            <Icon
              icon="search"
              iconLibrary="lucide"
              size={12}
              color="dimgray"
            />
          </span>
        )}
        {hasResults && (
          <span
            className={cn(
              'shrink-0',
              isSourcesOpen ? 'rotate-90' : 'hidden group-hover:block',
            )}
          >
            <Icon
              icon="chevron-right"
              iconLibrary="lucide"
              color="dimgray"
              size={15}
            />
          </span>
        )}
        <span className="text-base sm:text-sm flex items-center gap-1.5">
          {!hasResults ? (
            <ShimmerText>{`Searching for ${query}`}</ShimmerText>
          ) : (
            <span className="font-medium">{`Found results for ${query}`}</span>
          )}
        </span>
      </button>
      {isSourcesOpen && <div className="pl-6 pt-0.5 not-prose">{children}</div>}
    </>
  );
};

const hasVisibleParts = (parts: UIMessage['parts'] | undefined) =>
  parts?.some((part) => part.type === 'text' || part.type === 'tool-search') ??
  false;

const ChatSuggestions = ({ markdownLinks }: { markdownLinks: string }) => {
  const links = markdownLinks
    .split('\n')
    .map((line) => {
      const match = line.match(/\(([^)]*)\)\[([^\]]*)\]/);
      if (match && match[1] && match[2]) {
        return { label: match[1], path: match[2] };
      }
    })
    .filter((link) => link !== undefined);

  return (
    <div className="flex flex-col gap-3 not-prose">
      {links.map((link, idx) => {
        const href = isLocalUrl(link.path)
          ? normalizePath(link.path)
          : link.path;
        return (
          <a key={idx} href={href} className="block">
            <span
              className="flex items-center text-sm hover:brightness-75"
              style={{ color: 'var(--primary)' }}
            >
              <span className="truncate font-medium">{link.label}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
};

const MarkdownContent = ({ text }: { text: string }) => {
  return (
    <div className="prose prose-sm overflow-x-auto pb-1 max-w-none text-base lg:text-sm [&_p]:text-base lg:[&_p]:text-sm [&_li]:text-base lg:[&_li]:text-sm [&_ul]:text-base lg:[&_ul]:text-sm [&_ol]:text-base lg:[&_ol]:text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-gray-950">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-gray-950">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-gray-950">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-gray-950">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-semibold text-gray-950">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-base font-semibold text-gray-950">
              {children}
            </h6>
          ),
          a: ({ href, children, ...props }) => {
            const isLocal = isLocalUrl(href);
            const normalizedHref = isLocal ? normalizePath(href) : href;
            return (
              <a
                href={normalizedHref}
                target={isLocal ? undefined : '_blank'}
                rel={isLocal ? undefined : 'noopener noreferrer'}
                className="text-primary hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          p: ({ children }) => (
            <p className="whitespace-pre-line">{children}</p>
          ),
          pre: ({ children, ...props }) => {
            if (
              typeof children === 'object' &&
              children !== null &&
              'props' in children &&
              typeof children.props === 'object' &&
              children.props !== null &&
              'className' in children.props &&
              children.props.className === 'language-suggestions'
            ) {
              return children;
            }

            return (
              <pre
                {...props}
                className={cn(
                  'p-3 text-sm rounded-xl text-gray-950 bg-white border border-gray-200/70 overflow-x-auto',
                  props.className,
                )}
              >
                {children}
              </pre>
            );
          },
          code: ({ inline, children, ...props }: any) => {
            if (!inline && 'className' in props) {
              const match = /language-(\w+)/.exec(props.className || '');
              const language = match ? match[1] : undefined;
              if (language === 'suggestions' && typeof children === 'string') {
                return <ChatSuggestions markdownLinks={children} />;
              }
            }

            return inline ? (
              <code
                className="px-1 py-0.5 rounded bg-gray-100 text-sm"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code {...props}>{children}</code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

const ChatMarkdown = ({ text }: { text: string }) => {
  if (!text.trim()) {
    return null;
  }

  return <MarkdownContent text={text} />;
};

export const ChatResponse = React.forwardRef<HTMLDivElement, ChatResponseProps>(
  ({ className, message, isLast, hasError, ...props }, ref) => {
    const showWrapper = useMemo(
      () => hasVisibleParts(message.parts),
      [message.parts],
    );

    const content = message.parts
      .filter((p) => p.type === 'text')
      .map((p) => ('text' in p ? p.text : ''))
      .join('');

    if (hasError) {
      return (
        <div ref={ref} className={cn('py-4 text-sm', className)} {...props}>
          <span>Sorry, we could not generate a response to your question.</span>
        </div>
      );
    }

    if (!showWrapper) {
      return null;
    }

    if (message.parts && message.parts.length > 0) {
      return (
        <div
          ref={ref}
          className={cn('flex flex-col py-4 gap-4 self-stretch', className)}
          {...props}
        >
          {message.parts.map((part, index) => {
            if (part.type === 'text') {
              return <ChatMarkdown key={`text-${index}`} text={part.text} />;
            } else if (
              part.type === 'tool-search' &&
              'state' in part &&
              (part.state === 'input-streaming' ||
                part.state === 'input-available')
            ) {
              const query =
                'input' in part &&
                part.input &&
                typeof part.input === 'object' &&
                'query' in part.input
                  ? String(part.input.query)
                  : 'your documentation';
              const toolCallId =
                'toolCallId' in part ? String(part.toolCallId) : `${index}`;
              return (
                <SearchingContainer key={`${toolCallId}-call`} query={query} />
              );
            } else if (
              part.type === 'tool-search' &&
              'state' in part &&
              part.state === 'output-available'
            ) {
              const query =
                'input' in part &&
                part.input &&
                typeof part.input === 'object' &&
                'query' in part.input
                  ? String(part.input.query)
                  : 'your documentation';
              const toolCallId =
                'toolCallId' in part ? String(part.toolCallId) : `${index}`;

              const results =
                'output' in part &&
                part.output &&
                typeof part.output === 'object' &&
                'results' in part.output &&
                Array.isArray(part.output.results)
                  ? part.output.results
                  : [];

              return (
                <div
                  key={`${toolCallId}-result`}
                  className={cn(
                    'flex flex-col gap-3',
                    results.length === 0 && 'hidden',
                  )}
                >
                  <SearchingContainer query={query}>
                    <div className="flex gap-1 flex-col">
                      {results.map((result: any, idx: number) => (
                        <a
                          key={idx}
                          href={normalizePath(result.path)}
                          className="block py-1"
                        >
                          <span
                            className="flex items-center text-sm font-normal hover:brightness-75"
                            style={{ color: 'var(--primary)' }}
                          >
                            <span className="truncate">
                              {result.metadata?.title || result.path}
                            </span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </SearchingContainer>
                </div>
              );
            }
            return null;
          })}
          {content && (
            <div className="flex items-start gap-2 w-full">
              <div className="flex items-center gap-1">
                <CopyButton content={content} />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col py-4 gap-4 self-stretch', className)}
        {...props}
      >
        <ChatMarkdown text={content} />
        {content && (
          <div className="flex items-start gap-2 w-full">
            <div className="flex items-center gap-1">
              <CopyButton content={content} />
            </div>
          </div>
        )}
      </div>
    );
  },
);

ChatResponse.displayName = 'ChatResponse';
