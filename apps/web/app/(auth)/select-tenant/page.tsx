'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  scope: string;
  role: string;
}

export default function SelectTenantPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  useEffect(() => {
    async function fetchTenants() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (!response.ok || !data.tenants) {
          router.push('/login');
          return;
        }

        setTenants(data.tenants);
        
        if (data.tenants.length === 1) {
          setSelectedTenant(data.tenants[0].id);
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchTenants();
  }, [router]);

  const handleContinue = async () => {
    if (!selectedTenant) return;

    try {
      const response = await fetch('/api/auth/switch-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selectedTenant }),
      });

      if (!response.ok) {
        setError('Failed to switch tenant');
        return;
      }

      router.push('/overview');
    } catch (err) {
      setError('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  const scopeLabels: Record<string, string> = {
    hybrid: 'Hybride',
    ad: 'AD On-Premise',
    m365: 'Microsoft 365',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-accent-600 rounded-lg"></div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Selectionnez un tenant
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Vous avez acces a plusieurs organisations
          </p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {tenants.map((tenant) => (
              <label
                key={tenant.id}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedTenant === tenant.id
                    ? 'border-accent-600 bg-accent-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="tenant"
                  value={tenant.id}
                  checked={selectedTenant === tenant.id}
                  onChange={() => setSelectedTenant(tenant.id)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{tenant.name}</div>
                  <div className="text-sm text-slate-500">
                    {scopeLabels[tenant.scope] || tenant.scope} • {tenant.role}
                  </div>
                </div>
                {selectedTenant === tenant.id && (
                  <div className="h-5 w-5 rounded-full bg-accent-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedTenant}
            className="btn-primary w-full mt-6 disabled:opacity-50"
          >
           Continuer
          </button>
        </Card>
      </div>
    </div>
  );
}
