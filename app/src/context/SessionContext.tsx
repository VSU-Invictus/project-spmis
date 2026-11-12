import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import type { components } from '../../../contract/generated/schema';
import { apiClient, configureApiAuth, DEFAULT_MOCK_DEV_TOKEN, request } from '../lib/api';
import { supabase } from '../lib/supabase';

export type FacultyProfile = components['schemas']['FacultyProfile'];
export type MockRole = 'active' | 'pending' | 'admin';
export type SessionRole = 'faculty' | 'admin' | null;

export interface SessionContextValue {
  session: Session | null;
  profile: FacultyProfile | null;
  role: SessionRole;
  status: FacultyProfile['status'] | null;
  loading: boolean;
  error: Error | null;
  mockRole: MockRole | null;
  setMockRole: (role: MockRole) => void;
  syncProfile: (profile: FacultyProfile) => void;
}

const MOCK_ENABLED =
  import.meta.env.VITE_USE_MOCK_AUTH === 'true' &&
  (import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:4010') === 'http://localhost:4010';

const MOCK_DEPARTMENT_ID = '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb';
const MOCK_PROFILE_ID = 'e48adc9e-1b79-4b92-9848-aa12b25d63d7';
const MOCK_TIMESTAMP = '2026-10-26T00:00:00Z';

function createMockProfile(mockRole: MockRole): FacultyProfile {
  const admin = mockRole === 'admin';
  return {
    id: MOCK_PROFILE_ID,
    email: admin ? 'admin@example.edu' : 'alex.reyes@example.edu',
    full_name: admin ? 'SPMIS Administrator' : 'Alex Reyes',
    department_id: MOCK_DEPARTMENT_ID,
    role: admin ? 'admin' : 'faculty',
    status: mockRole === 'pending' ? 'pending' : 'active',
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
  };
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(!MOCK_ENABLED);
  const [error, setError] = useState<Error | null>(null);
  const [mockRole, setMockRoleState] = useState<MockRole>('active');

  const setMockRole = useCallback((nextRole: MockRole) => {
    if (!MOCK_ENABLED) return;
    setMockRoleState(nextRole);
  }, []);
  const syncProfile = useCallback((nextProfile: FacultyProfile) => {
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    if (MOCK_ENABLED) {
      configureApiAuth({ accessToken: DEFAULT_MOCK_DEV_TOKEN });
      setProfile(createMockProfile(mockRole));
      setLoading(false);
      return () => configureApiAuth({ accessToken: undefined });
    }

    let current = true;
    let resolution = 0;

    const resolveSession = async (nextSession: Session | null) => {
      const requestId = ++resolution;
      setSession(nextSession);
      setError(null);
      configureApiAuth({ accessToken: nextSession?.access_token });

      if (!nextSession) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ownProfile = await request(
          apiClient.GET('/rest/v1/rpc/get_own_profile')
        );
        if (current && requestId === resolution) setProfile(ownProfile ?? null);
      } catch (cause) {
        if (current && requestId === resolution) {
          setProfile(null);
          setError(cause instanceof Error ? cause : new Error('Unable to load your profile.'));
        }
      } finally {
        if (current && requestId === resolution) setLoading(false);
      }
    };

    if (!supabase) {
      configureApiAuth({ accessToken: undefined });
      setLoading(false);
      return () => {
        current = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void resolveSession(nextSession);
    });

    return () => {
      current = false;
      subscription.unsubscribe();
      configureApiAuth({ accessToken: undefined });
    };
  }, [mockRole]);

  const value = useMemo<SessionContextValue>(() => ({
    session,
    profile,
    role: profile?.role ?? null,
    status: profile?.status ?? null,
    loading,
    error,
    mockRole: MOCK_ENABLED ? mockRole : null,
    setMockRole,
    syncProfile,
  }), [session, profile, loading, error, mockRole, setMockRole, syncProfile]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}
