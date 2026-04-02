import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useRef, useState } from 'react';
import useMessagesStore from './useMessagesStore';

const SUBDOMAIN = import.meta.env.PUBLIC_MINTLIFY_SUBDOMAIN;
const API_KEY = import.meta.env.PUBLIC_MINTLIFY_ASSISTANT_KEY;

export const useAssistant = () => {
  const isClearedRef = useRef(false);
  const [input, setInput] = useState('');

  const { threadId, setThreadId, threadKey, setThreadKey } = useMessagesStore();

  useEffect(() => {
    sessionStorage.removeItem('assistant-threadKey');
    sessionStorage.removeItem('assistant-threadId');
    setThreadId(undefined);
    setThreadKey(undefined);
  }, []);

  const { messages, sendMessage, status, setMessages, stop } = useChat({
    id: `assistant-${SUBDOMAIN}`,
    transport: new DefaultChatTransport({
      api: `https://api.mintlify.com/discovery/v2/assistant/${SUBDOMAIN}/message`,
      headers: {
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
      },
      prepareSendMessagesRequest: ({ messages }) => {
        const storedKey = sessionStorage.getItem('assistant-threadKey');
        const storedId = sessionStorage.getItem('assistant-threadId');

        return {
          body: {
            messages,
            fp: 'anonymous',
            retrievalPageSize: 5,
            context: [],
            ...(storedId && { threadId: storedId }),
            ...(storedKey && { threadKey: storedKey }),
          },
        };
      },
      fetch: async (url, options) => {
        const response = await fetch(url, options);

        const tempThreadId = response.headers.get('x-thread-id');
        const tempThreadKey = response.headers.get('x-thread-key');

        if (tempThreadId && !isClearedRef.current) {
          setThreadId(tempThreadId);
          sessionStorage.setItem('assistant-threadId', tempThreadId);
        }
        if (tempThreadKey && !isClearedRef.current) {
          setThreadKey(tempThreadKey);
          sessionStorage.setItem('assistant-threadKey', tempThreadKey);
        }

        return response;
      },
    }),
  });

  useEffect(() => {
    useMessagesStore.setState({ messages });
  }, [messages]);

  useEffect(() => {
    useMessagesStore.setState({ status });
  }, [status]);

  const isLoading = status === 'streaming' || status === 'submitted';

  const onClear = useCallback(() => {
    isClearedRef.current = true;
    stop();
    setMessages([]);
    setInput('');
    setThreadId(undefined);
    setThreadKey(undefined);
    sessionStorage.removeItem('assistant-threadKey');
    sessionStorage.removeItem('assistant-threadId');
    useMessagesStore.setState({ messages: [] });
  }, [stop, setMessages, setThreadId, setThreadKey]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || status !== 'ready') return;
    isClearedRef.current = false;
    sendMessage({ text: input });
    setInput('');
  }, [input, status, sendMessage]);

  return {
    input,
    status,
    handleSubmit,
    setInput,
    messages,
    setMessages,
    isLoading,
    onClear,
    stop,
    threadId,
  };
};
