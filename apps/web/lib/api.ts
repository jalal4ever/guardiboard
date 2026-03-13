import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  scope: string;
  role: string;
}

export interface Session {
  user: SessionUser;
  tenants: Tenant[];
  currentTenant: Tenant | null;
  role: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    requireAuth?: boolean;
  } = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const { method = 'GET', body, requireAuth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_token');

    if (!sessionCookie) {
      return { data: null, error: 'Not authenticated', status: 401 };
    }

    headers['Authorization'] = `Bearer ${sessionCookie.value}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data.error || 'Request failed', status: response.status };
    }

    return { data, error: null, status: response.status };
  } catch (error) {
    console.error('API fetch error:', error);
    return { data: null, error: 'Failed to connect to API', status: 500 };
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_token');
  
  if (!sessionCookie) {
    return null;
  }

  const result = await fetchApi<Session>('/api/auth/me', { requireAuth: false });

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
