// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';

import { FacultyChatPage } from '../src/pages/faculty/FacultyChatPage';
import {
  SessionContext,
  type SessionContextValue,
} from '../src/context/SessionContext';
import { ChatProvider } from '../src/context/ChatContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { server } from '../src/mocks/server';

afterEach(() => {
  cleanup();
});

function renderChatPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const session: SessionContextValue = {
    session: null,
    profile: {
      id: 'e48adc9e-1b79-4b92-9848-aa12b25d63d7',
      email: 'faculty.test@example.edu',
      full_name: 'Test Faculty',
      department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
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
    setMockRole: () => undefined,
    syncProfile: () => undefined,
    refreshProfile: async () => null, signOut: async () => undefined,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={session}>
        <ThemeProvider>
          <ChatProvider>
            <MemoryRouter initialEntries={['/faculty/chat']}>
              <FacultyChatPage />
            </MemoryRouter>
          </ChatProvider>
        </ThemeProvider>
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe('Faculty chat retry flow', () => {
  it('retries successfully after a 429 response', async () => {
    const user = userEvent.setup();
    let requestCount = 0;

    server.use(
      http.post('*/functions/v1/chat', async ({ request }) => {
        requestCount += 1;

        if (requestCount === 1) {
          return HttpResponse.json(
            {
              code: 'RATE_LIMITED',
              message: 'Too many queries.',
              details: null,
              hint: 'Please wait a moment before trying again.',
            },
            { status: 429 },
          );
        }

        const body = (await request.json()) as {
          message?: string;
        };

        return HttpResponse.json({
          message: `Retry succeeded for: ${body.message ?? ''}`,
        });
      }),
    );

    renderChatPage();

    const input = await screen.findByPlaceholderText(
      /Ask about student skills/i,
    );

    await user.type(input, 'Recommend team leaders');

    await user.click(
      screen.getByRole('button', { name: /send message/i }),
    );

    expect(await screen.findByText('RATE_LIMITED')).toBeInTheDocument();

    expect(
      await screen.findByText(/Please wait a moment before trying again\./i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /retry prompt/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('Retry succeeded for: Recommend team leaders'),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText('RATE_LIMITED')).not.toBeInTheDocument();
    expect(requestCount).toBe(2);
  });
});
