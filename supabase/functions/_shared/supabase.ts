import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { FunctionError } from './errors.ts';

const url = Deno.env.get('SUPABASE_URL')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export function callerClient(request: Request): SupabaseClient {
  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: request.headers.get('Authorization') ?? '',
      },
    },
  });
}

export function adminClient(): SupabaseClient {
  return createClient(url, serviceRoleKey);
}

export async function requireUser(request: Request): Promise<{
  client: SupabaseClient;
  id: string;
}> {
  const client = callerClient(request);
  const { data, error } = await client.auth.getUser();
  if (error) {
    throw new FunctionError(500, 'AUTHENTICATION_ERROR', 'The authentication provider could not be reached.', error.message);
  }
  if (!data.user) {
    throw new FunctionError(401, 'UNAUTHORIZED', 'Authentication is required.');
  }
  return { client, id: data.user.id };
}

export async function getProfile(request: Request): Promise<{
  client: SupabaseClient;
  id: string;
  role: 'faculty' | 'admin';
}> {
  const result = await requireUser(request);
  const { data, error } = await result.client
    .from('faculty_profiles')
    .select('role,status')
    .eq('id', result.id)
    .maybeSingle();
  if (error) {
    throw new FunctionError(500, 'DATABASE_ERROR', 'The faculty profile could not be loaded.', error.message);
  }
  if (!data || data.status !== 'active' || !['faculty', 'admin'].includes(data.role)) {
    throw new FunctionError(403, 'FORBIDDEN', 'An active faculty profile is required.');
  }
  return { ...result, role: data.role };
}
