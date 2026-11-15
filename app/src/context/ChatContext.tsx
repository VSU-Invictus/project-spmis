import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useAskChatbot, type ChatTurn } from '../hooks/useAskChatbot';
import { ApiRequestError } from '../lib/api';
import { SessionContext } from './SessionContext';

export type ChatStatus =
  | 'idle'
  | 'sending'
  | 'succeeded'
  | 'rate_limited'
  | 'failed'
  | 'retrying';

export interface ChatUiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatErrorState {
  code: string;
  message: string;
  hint: string | null;
}

export interface ChatState {
  status: ChatStatus;
  messages: ChatUiMessage[];
  pendingMessage: string | null;
  error: ChatErrorState | null;
  simulateRateLimit: boolean;
}

export type ChatAction =
  | { type: 'SEND_START'; payload: { text: string } }
  | { type: 'SEND_SUCCESS'; payload: { message: string } }
  | { type: 'SEND_RATE_LIMITED'; payload: ChatErrorState }
  | { type: 'SEND_FAILED'; payload: ChatErrorState }
  | { type: 'RETRY_START' }
  | { type: 'DISMISS_ERROR' }
  | { type: 'SET_SIMULATE_RATE_LIMIT'; payload: boolean }
  | { type: 'RESET_CHAT' }
  | { type: 'CLEAR_CHAT' };

export const INITIAL_WELCOME_MESSAGE: ChatUiMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content:
    'Hello! I am your AI Chat Assistant. I can synthesize visible faculty reviews across academic departments to help you identify student strengths and recommend candidates for opportunities.',
  timestamp: 'Just now',
};

export const initialChatState: ChatState = {
  status: 'idle',
  messages: [INITIAL_WELCOME_MESSAGE],
  pendingMessage: null,
  error: null,
  simulateRateLimit: false,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_START':
      return {
        ...state,
        status: 'sending',
        error: null,
        pendingMessage: action.payload.text,
        messages: [
          ...state.messages,
          {
            id: `user-${Date.now()}`,
            role: 'user',
            content: action.payload.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };

    case 'SEND_SUCCESS':
      return {
        ...state,
        status: 'succeeded',
        pendingMessage: null,
        error: null,
        messages: [
          ...state.messages,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: action.payload.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };

    case 'SEND_RATE_LIMITED':
      return {
        ...state,
        status: 'rate_limited',
        error: {
          code: action.payload.code || 'RATE_LIMITED',
          message: action.payload.message || 'Rate limit exceeded.',
          hint: action.payload.hint ?? 'Please wait a moment before trying again.',
        },
      };

    case 'SEND_FAILED':
      return {
        ...state,
        status: 'failed',
        error: {
          code: action.payload.code || 'CLIENT_ERROR',
          message: action.payload.message || 'Failed to communicate with assistant.',
          hint: action.payload.hint ?? null,
        },
      };

    case 'RETRY_START':
      return {
        ...state,
        status: 'retrying',
        error: null,
      };

    case 'DISMISS_ERROR':
      return {
        ...state,
        status: 'idle',
        error: null,
      };

    case 'SET_SIMULATE_RATE_LIMIT':
      return {
        ...state,
        simulateRateLimit: action.payload,
      };

    case 'RESET_CHAT':
    case 'CLEAR_CHAT':
      return {
        ...initialChatState,
      };

    default:
      return state;
  }
}

export interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  isPending: boolean;
  sendMessage: (text: string, forceSuccess?: boolean) => void;
  retryLastMessage: () => void;
  dismissError: () => void;
  setSimulateRateLimit: (simulate: boolean) => void;
  resetChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);

  const session = useContext(SessionContext);
  const currentUserId = session?.profile?.id ?? null;
  const previousUserIdRef = useRef<string | null>(currentUserId);

  useEffect(() => {
    if (previousUserIdRef.current !== currentUserId) {
      previousUserIdRef.current = currentUserId;
      dispatch({ type: 'RESET_CHAT' });
    }
  }, [currentUserId]);

  const askChatbotMutation = useAskChatbot();

  const handleMutationSuccess = useCallback((data: { message: string }) => {
    dispatch({ type: 'SEND_SUCCESS', payload: { message: data.message } });
  }, []);

  const handleMutationError = useCallback((err: ApiRequestError | Error) => {
    if (err instanceof ApiRequestError) {
      if (err.status === 429 || err.code === 'RATE_LIMITED') {
        dispatch({
          type: 'SEND_RATE_LIMITED',
          payload: {
            code: err.code || 'RATE_LIMITED',
            message: err.message,
            hint: err.hint,
          },
        });
        return;
      }
      dispatch({
        type: 'SEND_FAILED',
        payload: {
          code: err.code || 'API_ERROR',
          message: err.message,
          hint: err.hint,
        },
      });
    } else {
      dispatch({
        type: 'SEND_FAILED',
        payload: {
          code: 'CLIENT_ERROR',
          message: err.message,
          hint: 'Check your server connection or try again.',
        },
      });
    }
  }, []);

  const sendMessage = useCallback(
    (textToSend: string, forceSuccess = false) => {
      const text = textToSend.trim();
      if (!text || askChatbotMutation.isPending) return;

      const isRetry = text === state.pendingMessage && (state.status === 'rate_limited' || state.status === 'failed');

      if (isRetry) {
        dispatch({ type: 'RETRY_START' });
      } else {
        dispatch({ type: 'SEND_START', payload: { text } });
      }

      // Convert prior UI messages to contract ChatTurn format.
      // On retry, exclude the current user message at the tail to prevent duplicating it in history.
      // Also cap to 20 turns per contract maxItems: 20.
      const priorMessages =
        isRetry &&
        state.messages.length > 0 &&
        state.messages[state.messages.length - 1].role === 'user'
          ? state.messages.slice(0, -1)
          : state.messages;

      const history: ChatTurn[] = priorMessages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))
        .slice(-20);

      const isRateLimit = import.meta.env.DEV && (forceSuccess ? false : state.simulateRateLimit);
      const headers = import.meta.env.DEV && isRateLimit ? { Prefer: 'code=429' } : undefined;

      askChatbotMutation.mutate(
        {
          body: {
            message: text,
            history,
          },
          headers,
        },
        {
          onSuccess: handleMutationSuccess,
          onError: handleMutationError,
        }
      );
    },
    [askChatbotMutation, handleMutationError, handleMutationSuccess, state.messages, state.pendingMessage, state.simulateRateLimit, state.status]
  );

  const retryLastMessage = useCallback(() => {
    if (state.pendingMessage) {
      sendMessage(state.pendingMessage, true);
    }
  }, [sendMessage, state.pendingMessage]);

  const dismissError = useCallback(() => {
    dispatch({ type: 'DISMISS_ERROR' });
  }, []);

  const setSimulateRateLimit = useCallback((simulate: boolean) => {
    dispatch({ type: 'SET_SIMULATE_RATE_LIMIT', payload: simulate });
  }, []);

  const resetChat = useCallback(() => {
    dispatch({ type: 'RESET_CHAT' });
  }, []);

  const isPending = state.status === 'sending' || state.status === 'retrying' || askChatbotMutation.isPending;

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        isPending,
        sendMessage,
        retryLastMessage,
        dismissError,
        setSimulateRateLimit,
        resetChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

export const useChat = useChatContext;
