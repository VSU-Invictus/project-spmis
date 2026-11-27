// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import {
  ChatProvider,
  useChat,
  chatReducer,
  initialChatState,
  INITIAL_WELCOME_MESSAGE,
  type ChatState,
} from './ChatContext';
import { SessionContext, type SessionContextValue } from './SessionContext';
import type { ChatRequest } from '../hooks/useAskChatbot';

afterEach(() => {
  cleanup();
});

describe('ChatContext state machine (#156)', () => {
  it('initializes in idle state with the welcome message and no errors', () => {
    expect(initialChatState.status).toBe('idle');
    expect(initialChatState.messages).toHaveLength(1);
    expect(initialChatState.messages[0]).toEqual(INITIAL_WELCOME_MESSAGE);
    expect(initialChatState.pendingMessage).toBeNull();
    expect(initialChatState.error).toBeNull();
    expect(initialChatState.simulateRateLimit).toBe(false);
  });

  it('transitions idle -> sending on SEND_START and records pending prompt', () => {
    const nextState = chatReducer(initialChatState, {
      type: 'SEND_START',
      payload: { text: 'Which students excel in robotics?' },
    });

    expect(nextState.status).toBe('sending');
    expect(nextState.pendingMessage).toBe('Which students excel in robotics?');
    expect(nextState.messages).toHaveLength(2);
    expect(nextState.messages[1].role).toBe('user');
    expect(nextState.messages[1].content).toBe('Which students excel in robotics?');
    expect(nextState.error).toBeNull();
  });

  it('transitions sending -> succeeded on SEND_SUCCESS and clears pending message', () => {
    const sendingState: ChatState = {
      ...initialChatState,
      status: 'sending',
      pendingMessage: 'Which students excel in robotics?',
      messages: [
        INITIAL_WELCOME_MESSAGE,
        {
          id: 'user-1',
          role: 'user',
          content: 'Which students excel in robotics?',
          timestamp: '10:00 AM',
        },
      ],
    };

    const nextState = chatReducer(sendingState, {
      type: 'SEND_SUCCESS',
      payload: { message: 'Student Alex Cruz has 3 reviews praising robotics proficiency.' },
    });

    expect(nextState.status).toBe('succeeded');
    expect(nextState.pendingMessage).toBeNull();
    expect(nextState.error).toBeNull();
    expect(nextState.messages).toHaveLength(3);
    expect(nextState.messages[2].role).toBe('assistant');
    expect(nextState.messages[2].content).toBe('Student Alex Cruz has 3 reviews praising robotics proficiency.');
  });

  it('transitions sending -> rate_limited on 429 RATE_LIMITED, preserving user message and error hint', () => {
    const sendingState: ChatState = {
      ...initialChatState,
      status: 'sending',
      pendingMessage: 'Which students excel in robotics?',
      messages: [
        INITIAL_WELCOME_MESSAGE,
        {
          id: 'user-1',
          role: 'user',
          content: 'Which students excel in robotics?',
          timestamp: '10:00 AM',
        },
      ],
    };

    const nextState = chatReducer(sendingState, {
      type: 'SEND_RATE_LIMITED',
      payload: {
        code: 'RATE_LIMITED',
        message: 'The AI Chat Assistant is temporarily unavailable due to rate limits.',
        hint: 'Please wait 60 seconds before retrying.',
      },
    });

    expect(nextState.status).toBe('rate_limited');
    // Crucial requirement: pending prompt is preserved for retry
    expect(nextState.pendingMessage).toBe('Which students excel in robotics?');
    expect(nextState.error).toEqual({
      code: 'RATE_LIMITED',
      message: 'The AI Chat Assistant is temporarily unavailable due to rate limits.',
      hint: 'Please wait 60 seconds before retrying.',
    });
    // Messages list preserved
    expect(nextState.messages).toHaveLength(2);
  });

  it('transitions rate_limited -> retrying on RETRY_START', () => {
    const rateLimitedState: ChatState = {
      ...initialChatState,
      status: 'rate_limited',
      pendingMessage: 'Which students excel in robotics?',
      error: {
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded.',
        hint: 'Wait 30s.',
      },
    };

    const nextState = chatReducer(rateLimitedState, {
      type: 'RETRY_START',
    });

    expect(nextState.status).toBe('retrying');
    expect(nextState.pendingMessage).toBe('Which students excel in robotics?');
    expect(nextState.error).toBeNull();
  });

  it('transitions sending -> failed on generic error and stores error state', () => {
    const sendingState: ChatState = {
      ...initialChatState,
      status: 'sending',
      pendingMessage: 'Recommend leadership candidates',
    };

    const nextState = chatReducer(sendingState, {
      type: 'SEND_FAILED',
      payload: {
        code: 'SERVER_ERROR',
        message: 'Internal server error.',
        hint: 'Check network connectivity.',
      },
    });

    expect(nextState.status).toBe('failed');
    expect(nextState.pendingMessage).toBe('Recommend leadership candidates');
    expect(nextState.error?.code).toBe('SERVER_ERROR');
  });

  it('clears error and resets to idle on DISMISS_ERROR', () => {
    const rateLimitedState: ChatState = {
      ...initialChatState,
      status: 'rate_limited',
      error: { code: 'RATE_LIMITED', message: 'Rate limited', hint: null },
    };

    const nextState = chatReducer(rateLimitedState, {
      type: 'DISMISS_ERROR',
    });

    expect(nextState.status).toBe('idle');
    expect(nextState.error).toBeNull();
  });

  it('toggles simulateRateLimit flag', () => {
    const state = chatReducer(initialChatState, {
      type: 'SET_SIMULATE_RATE_LIMIT',
      payload: true,
    });
    expect(state.simulateRateLimit).toBe(true);

    const reset = chatReducer(state, {
      type: 'SET_SIMULATE_RATE_LIMIT',
      payload: false,
    });
    expect(reset.simulateRateLimit).toBe(false);
  });

  it('resets chat to initial welcome state on RESET_CHAT', () => {
    const dirtyState: ChatState = {
      status: 'rate_limited',
      messages: [
        INITIAL_WELCOME_MESSAGE,
        { id: '1', role: 'user', content: 'test', timestamp: '1' },
      ],
      pendingMessage: 'test',
      error: { code: 'RATE_LIMITED', message: 'err', hint: null },
      simulateRateLimit: true,
    };

    const resetState = chatReducer(dirtyState, {
      type: 'RESET_CHAT',
    });

    expect(resetState).toEqual(initialChatState);
  });

  it('resets chat to initial welcome state on CLEAR_CHAT alias', () => {
    const dirtyState: ChatState = {
      status: 'rate_limited',
      messages: [
        INITIAL_WELCOME_MESSAGE,
        { id: '1', role: 'user', content: 'test', timestamp: '1' },
      ],
      pendingMessage: 'test',
      error: { code: 'RATE_LIMITED', message: 'err', hint: null },
      simulateRateLimit: true,
    };

    const resetState = chatReducer(dirtyState, {
      type: 'CLEAR_CHAT',
    });

    expect(resetState).toEqual(initialChatState);
  });
});

function TestChatComponent() {
  const { state, sendMessage, retryLastMessage } = useChat();
  return (
    <div>
      <div data-testid="status">{state.status}</div>
      <div data-testid="message-count">{state.messages.length}</div>
      <div data-testid="pending-message">{state.pendingMessage ?? ''}</div>
      <button onClick={() => sendMessage('Hello world')}>Send Message</button>
      <button onClick={() => retryLastMessage()}>Retry Last</button>
    </div>
  );
}

describe('ChatProvider integration (#156)', () => {
  it('resets chat state when session profile id changes or signs out', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const createMockSession = (profileId: string | null): SessionContextValue => ({
      session: null,
      profile: profileId
        ? {
            id: profileId,
            email: `${profileId}@example.edu`,
            full_name: 'Test User',
            department_id: 'dept-1',
            role: 'faculty',
            status: 'active',
            created_at: '2026-10-26T00:00:00Z',
            updated_at: '2026-10-26T00:00:00Z',
          }
        : null,
      role: profileId ? 'faculty' : null,
      status: profileId ? 'active' : null,
      loading: false,
      error: null,
      mockRole: null,
      setMockRole: () => {},
      syncProfile: () => {},
      refreshProfile: async () => null, signOut: async () => {},
    });

    function TestApp({ profileId }: { profileId: string | null }) {
      return (
        <QueryClientProvider client={queryClient}>
          <SessionContext.Provider value={createMockSession(profileId)}>
            <ChatProvider>
              <TestChatComponent />
            </ChatProvider>
          </SessionContext.Provider>
        </QueryClientProvider>
      );
    }

    const { rerender } = render(<TestApp profileId="faculty-user-1" />);

    expect(screen.getByTestId('message-count')).toHaveTextContent('1');

    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('succeeded');
    });
    expect(screen.getByTestId('message-count')).toHaveTextContent('3');

    // Sign out (profile becomes null)
    rerender(<TestApp profileId={null} />);

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('idle');
      expect(screen.getByTestId('message-count')).toHaveTextContent('1');
    });

    // Sign in as different user
    rerender(<TestApp profileId="faculty-user-2" />);

    expect(screen.getByTestId('status')).toHaveTextContent('idle');
    expect(screen.getByTestId('message-count')).toHaveTextContent('1');
  });

  it('does not duplicate pending prompt in history on retry and caps history to 20 turns', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const capturedRequests: ChatRequest[] = [];

    server.use(
      http.post('*/functions/v1/chat', async ({ request }) => {
        const body = (await request.json()) as ChatRequest;
        capturedRequests.push(body);
        if (capturedRequests.length === 1) {
          return HttpResponse.json(
            {
              code: 'RATE_LIMITED',
              message: 'Rate limited',
              details: null,
              hint: 'Please retry.',
            },
            { status: 429 }
          );
        }
        return HttpResponse.json({ message: 'Success answer' });
      })
    );

    const mockSession: SessionContextValue = {
      session: null,
      profile: {
        id: 'faculty-1',
        email: 'fac1@example.edu',
        full_name: 'Faculty One',
        department_id: 'dept-1',
        role: 'faculty',
        status: 'active',
        created_at: '2026-10-26T00:00:00Z',
        updated_at: '2026-10-26T00:00:00Z',
      },
      role: 'faculty',
      status: 'active',
      loading: false,
      error: null,
      mockRole: null,
      setMockRole: () => {},
      syncProfile: () => {},
      refreshProfile: async () => null, signOut: async () => {},
    };

    render(
      <QueryClientProvider client={queryClient}>
        <SessionContext.Provider value={mockSession}>
          <ChatProvider>
            <TestChatComponent />
          </ChatProvider>
        </SessionContext.Provider>
      </QueryClientProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('rate_limited');
      expect(screen.getByTestId('pending-message')).toHaveTextContent('Hello world');
    });

    expect(capturedRequests).toHaveLength(1);
    expect(capturedRequests[0].message).toBe('Hello world');
    expect(capturedRequests[0].history).toEqual([]);

    await userEvent.click(screen.getByRole('button', { name: 'Retry Last' }));

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('succeeded');
    });

    expect(capturedRequests).toHaveLength(2);
    expect(capturedRequests[1].message).toBe('Hello world');
    // On retry, history must NOT contain the pending 'Hello world' message
    expect(capturedRequests[1].history).toEqual([]);
  });

  it('caps history to the 20 most recent turns when conversation grows', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    let lastCapturedHistory: any[] = [];

    server.use(
      http.post('*/functions/v1/chat', async ({ request }) => {
        const body = (await request.json()) as ChatRequest;
        lastCapturedHistory = body.history ?? [];
        return HttpResponse.json({ message: 'Success' });
      })
    );

    function PopulatedChatComponent() {
      const { dispatch, sendMessage } = useChat();

      const seedHistory = () => {
        for (let i = 1; i <= 12; i++) {
          dispatch({
            type: 'SEND_START',
            payload: { text: `Question ${i}` },
          });
          dispatch({
            type: 'SEND_SUCCESS',
            payload: { message: `Answer ${i}` },
          });
        }
      };

      return (
        <div>
          <button onClick={seedHistory}>Seed History</button>
          <button onClick={() => sendMessage('Final question')}>Send Final</button>
        </div>
      );
    }

    render(
      <QueryClientProvider client={queryClient}>
        <SessionContext.Provider
          value={{
            session: null,
            profile: null,
            role: null,
            status: null,
            loading: false,
            error: null,
            mockRole: null,
            setMockRole: () => {},
            syncProfile: () => {},
            refreshProfile: async () => null, signOut: async () => {},
          }}
        >
          <ChatProvider>
            <PopulatedChatComponent />
          </ChatProvider>
        </SessionContext.Provider>
      </QueryClientProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Seed History' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send Final' }));

    await waitFor(() => {
      expect(lastCapturedHistory.length).toBe(20);
    });
    expect(lastCapturedHistory.length).toBe(20);
    // The oldest message in capped history should be Question 3 (since 24 turns - 20 = 4 dropped)
    expect(lastCapturedHistory[0].content).toBe('Question 3');
    expect(lastCapturedHistory[19].content).toBe('Answer 12');
  });
});

