import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { QueryClientContext } from '@tanstack/react-query';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { components } from '../../../contract/generated/schema';
import { apiClient, configureApiAuth, DEFAULT_MOCK_DEV_TOKEN, request } from '../lib/api';
import { isLocalMockAuth, supabase } from '../lib/supabase';

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
  /** Re-reads getOwnProfile and updates session state. */
  refreshProfile: () => Promise<FacultyProfile | null>;
  signOut: () => Promise<void>;
}

const MOCK_ENABLED = isLocalMockAuth;
const MOCK_ROLE_STORAGE_KEY = 'spmis-mock-role';
const MOCK_ROLES: MockRole[] = ['active', 'pending', 'admin'];

function readMockRole(): MockRole {
  if (!MOCK_ENABLED || typeof window === 'undefined') return 'active';
  try {
    const stored = window.localStorage.getItem(MOCK_ROLE_STORAGE_KEY);
    return MOCK_ROLES.includes(stored as MockRole) ? stored as MockRole : 'active';
  } catch {
    return 'active';
  }
}

const MOCK_DEPARTMENT_ID = '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb';
const MOCK_PROFILE_ID = 'e48adc9e-1b79-4b92-9848-aa12b25d63d7';
const MOCK_TIMESTAMP = '2026-10-26T00:00:00Z';

function createMockProfile(mockRole: MockRole): FacultyProfile {
  const admin = mockRole === 'admin';
  return {
    id: MOCK_PROFILE_ID,
    email: admin ? 'admin@example.edu' : 'alex.morgan@example.edu',
    full_name: admin ? 'SPMIS Administrator' : 'Alex Morgan',
    department_id: MOCK_DEPARTMENT_ID,
    role: admin ? 'admin' : 'faculty',
    status: mockRole === 'pending' ? 'pending' : 'active',
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
  };
}

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useContext(QueryClientContext);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mockRole, setMockRoleState] = useState<MockRole>(readMockRole);
  const hasResolvedInitialSessionRef = useRef(false);
  const lastResolvedUserIdRef = useRef<string | null>(null);

  const setMockRole = useCallback((nextRole: MockRole) => {
    if (!MOCK_ENABLED) return;
    setLoading(true);
    queryClient?.clear();
    setProfile(createMockProfile(nextRole));
    setMockRoleState(nextRole);
    try {
      window.localStorage.setItem(MOCK_ROLE_STORAGE_KEY, nextRole);
    } catch {
      // Role switching still works for the current session if storage is unavailable.
    }
    setLoading(false);
  }, [queryClient]);
  const syncProfile = useCallback((nextProfile: FacultyProfile) => {
    setProfile(nextProfile);
  }, []);
  const refreshProfile = useCallback(async (): Promise<FacultyProfile | null> => {
    if (MOCK_ENABLED) return profile;
    const ownProfile = (await request(apiClient.GET('/rest/v1/rpc/get_own_profile'))) ?? null;
    setProfile(ownProfile);
    return ownProfile;
  }, [profile]);
  const signOut = useCallback(async () => {
    if (MOCK_ENABLED) {
      queryClient?.clear();
      setProfile(null);
      setSession(null);
      return;
    }
    if (supabase) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    }
    queryClient?.clear();
    lastResolvedUserIdRef.current = null;
    configureApiAuth({ accessToken: undefined });
    setSession(null);
    setProfile(null);
    setLoading(false);
  }, [queryClient]);

  useEffect(() => {
    if (MOCK_ENABLED) {
      configureApiAuth({ accessToken: DEFAULT_MOCK_DEV_TOKEN });
      setProfile(createMockProfile(mockRole));
      setLoading(false);
      return () => configureApiAuth({ accessToken: undefined });
    }

    let current = true;
    let resolution = 0;

    const resolveSession = async (event: AuthChangeEvent, nextSession: Session | null) => {
      const requestId = ++resolution;
      const prevUserId = lastResolvedUserIdRef.current;
      const nextUserId = nextSession?.user?.id ?? null;
      const userChanged = prevUserId !== nextUserId;

      if (prevUserId !== null && userChanged) {
        queryClient?.clear();
      }
      lastResolvedUserIdRef.current = nextUserId;

      setSession(nextSession);
      setError(null);
      configureApiAuth({ accessToken: nextSession?.access_token });

      if (!nextSession) {
        hasResolvedInitialSessionRef.current = true;
        setProfile(null);
        setLoading(false);
        return;
      }

      const isSilentRefresh =
        hasResolvedInitialSessionRef.current &&
        !userChanged &&
        (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN');
      const shouldShowLoading = !isSilentRefresh && (!hasResolvedInitialSessionRef.current || userChanged);

      if (shouldShowLoading) {
        setLoading(true);
      }

      try {
        const ownProfile = await request(
          apiClient.GET('/rest/v1/rpc/get_own_profile')
        );
        if (current && requestId === resolution) {
          setProfile(ownProfile ?? null);
          hasResolvedInitialSessionRef.current = true;
        }
      } catch (cause) {
        if (current && requestId === resolution) {
          if (shouldShowLoading) {
            setProfile(null);
            setError(cause instanceof Error ? cause : new Error('Unable to load your profile.'));
          }
          hasResolvedInitialSessionRef.current = true;
        }
      } finally {
        if (current && requestId === resolution) {
          setLoading(false);
        }
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
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      void resolveSession(event, nextSession);
    });

    return () => {
      current = false;
      subscription.unsubscribe();
      configureApiAuth({ accessToken: undefined });
    };
  }, [mockRole, queryClient]);

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
    refreshProfile,
    signOut,
  }), [session, profile, loading, error, mockRole, setMockRole, syncProfile, refreshProfile, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
}
