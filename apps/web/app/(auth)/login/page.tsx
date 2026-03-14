'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const errorParam = searchParams.get('error');

  const handleMicrosoftLogin = async () => {
    setOauthLoading(true);
    try {
      const response = await fetch('/api/auth/oauth/microsoft');
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to initialize Microsoft login');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      document.cookie = `gb_session=${data.token}; path=/; max-age=86400; HttpOnly`;

      if (data.requiresTenantSelection) {
        router.push('/select-tenant');
      } else if (data.tenants && data.tenants.length > 0) {
        const tenantResponse = await fetch(`${API_URL}/api/auth/switch-tenant`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          },
          body: JSON.stringify({ tenantId: data.tenants[0].id }),
        });
        
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          document.cookie = `gb_session=${tenantData.token}; path=/; max-age=86400; HttpOnly`;
          router.push('/overview');
        } else {
          setError('Failed to select tenant');
        }
      } else {
        router.push('/overview');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <div className="w-10 h-10 bg-accent-600 rounded-lg mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-slate-900">
            Guardiboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Security posture monitoring
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {errorParam && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {errorParam === 'no_token' && 'Authentication failed. Please try again.'}
              {errorParam === 'callback_failed' && 'Authentication failed. Please try again.'}
              {errorParam === 'missing_params' && 'Missing authentication parameters.'}
              {errorParam === 'invalid_state' && 'Invalid authentication request. Please try again.'}
              {errorParam === 'no_email' && 'Could not retrieve email from Microsoft account.'}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
              placeholder="Email"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">or</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={oauthLoading}
              className="w-full py-2.5 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {oauthLoading ? 'Redirecting...' : 'Sign in with Microsoft'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          No account?{' '}
          <Link href="/register" className="text-accent-600 hover:text-accent-700 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
