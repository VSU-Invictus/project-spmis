import { describe, it, expect } from 'vitest';
import {
  chatReducer,
  initialChatState,
  INITIAL_WELCOME_MESSAGE,
  type ChatState,
} from './ChatContext';

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
});
