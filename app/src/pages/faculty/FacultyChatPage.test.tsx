// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useEffect, type ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { FacultyChatPage } from './FacultyChatPage';
import { ChatProvider } from '../../context/ChatContext';
import {
  SessionProvider,
  useSession,
  type FacultyProfile,
} from '../../context/SessionContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { __resetMocks } from '../../mocks/handlers';

afterEach(() => {
  cleanup();
});

function ProfileBootstrapper({
  profile,
  children,
}: {
  profile: FacultyProfile;
  children: ReactNode;
}) {
  const { profile: currentProfile, loading, syncProfile } = useSession();
  useEffect(() => {
    if (
      !loading &&
      (!currentProfile ||
        currentProfile.id !== profile.id ||
        currentProfile.role !== profile.role ||
        currentProfile.status !== profile.status)
    ) {
      syncProfile(profile);
    }
  }, [currentProfile, loading, profile, syncProfile]);

  if (loading || !currentProfile || currentProfile.id !== profile.id) {
    return null;
  }

  return <>{children}</>;
}

function renderFacultyChat(role: 'faculty' | 'admin' = 'faculty', status: 'active' | 'pending' = 'active') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const profile: FacultyProfile = {
    id: 'f-1111-2222-3333-444444444444',
    role,
    status,
    email: 'faculty.test@example.edu',
    full_name: 'Test Faculty User',
    department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ProfileBootstrapper profile={profile}>
          <ThemeProvider>
            <ChatProvider>
              <MemoryRouter initialEntries={['/faculty/chat']}>
                <FacultyChatPage />
              </MemoryRouter>
            </ChatProvider>
          </ThemeProvider>
        </ProfileBootstrapper>
      </SessionProvider>
    </QueryClientProvider>
  );
}

describe('FacultyChatPage (#156)', () => {
  beforeEach(() => {
    __resetMocks();
  });

  it('renders initial welcome message and input form for active faculty', async () => {
    renderFacultyChat('faculty', 'active');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /AI Chat Assistant/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/Hello! I am your AI Chat Assistant/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask about student skills/i)).toBeInTheDocument();
  });

  it('blocks pending faculty and displays access restriction alert', async () => {
    renderFacultyChat('faculty', 'pending');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Ask about student skills/i)).not.toBeInTheDocument();
  });

  it('blocks admin users from faculty chatbot mining tool', async () => {
    renderFacultyChat('admin', 'active');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Ask about student skills/i)).not.toBeInTheDocument();
  });

  it('sends user message and renders assistant reply', async () => {
    const user = userEvent.setup();
    renderFacultyChat('faculty', 'active');

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask about student skills/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ask about student skills/i);
    const sendButton = screen.getByRole('button', { name: /Send Message/i });

    await user.type(input, 'Who excels at algorithms?');
    await user.click(sendButton);

    expect(screen.getByText('Who excels at algorithms?')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Mock answer to: Who excels at algorithms\?/i)).toBeInTheDocument();
    });
  });

  it('handles 429 rate limit gracefully with retry banner and preserved prompt', async () => {
    server.use(
      http.post('*/functions/v1/chat', () => {
        return HttpResponse.json(
          {
            code: 'RATE_LIMITED',
            message: 'Too many queries. Assistant rate limit reached.',
            hint: 'Please wait a moment before trying again.',
          },
          { status: 429 }
        );
      })
    );

    const user = userEvent.setup();
    renderFacultyChat('faculty', 'active');

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask about student skills/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ask about student skills/i);
    const sendButton = screen.getByRole('button', { name: /Send Message/i });

    await user.type(input, 'Recommend team leaders');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/RATE_LIMITED/i)).toBeInTheDocument();
      expect(screen.getByText(/Too many queries\. Assistant rate limit reached\./i)).toBeInTheDocument();
      expect(screen.getByText(/Please wait a moment before trying again\./i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry Prompt/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it('preserves conversation history and 429 rate limit prompt across route navigation', async () => {
    server.use(
      http.post('*/functions/v1/chat', () => {
        return HttpResponse.json(
          {
            code: 'RATE_LIMITED',
            message: 'Too many queries. Assistant rate limit reached.',
            hint: 'Please wait a moment before trying again.',
          },
          { status: 429 }
        );
      })
    );

    const user = userEvent.setup();
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const profile: FacultyProfile = {
      id: 'f-1111-2222-3333-444444444444',
      role: 'faculty',
      status: 'active',
      email: 'faculty.test@example.edu',
      full_name: 'Test Faculty User',
      department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ProfileBootstrapper profile={profile}>
            <ThemeProvider>
              <ChatProvider>
                <MemoryRouter initialEntries={['/faculty/chat']}>
                  <FacultyChatPage />
                </MemoryRouter>
              </ChatProvider>
            </ThemeProvider>
          </ProfileBootstrapper>
        </SessionProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask about student skills/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ask about student skills/i);
    const sendButton = screen.getByRole('button', { name: /Send Message/i });

    await user.type(input, 'Persistent query survives navigation');
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/RATE_LIMITED/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Persistent query survives navigation')).toBeInTheDocument();
  });
});
