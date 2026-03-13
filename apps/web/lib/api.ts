import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

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
    const sessionCookie = cookieStore.get('gb_session');

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

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('gb_session');
  
  if (!sessionCookie) {
    return null;
  }

  const result = await fetchApi<{
    user: { id: string; email: string; name: string };
    tenants: Array<{ id: string; name: string; slug: string; scope: string; role: string }>;
    currentTenant: { id: string; name: string; slug: string; scope: string } | null;
    role: string;
  }>('/api/auth/me', { requireAuth: false });

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

export function clearSession() {
  return cookies().then(cookieStore => {
    cookieStore.delete('gb_session');
  });
}
