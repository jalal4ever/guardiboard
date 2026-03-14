'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

type Scope = 'hybrid' | 'ad' | 'm365';

interface WorkspaceData {
  name: string;
  slug: string;
  description: string;
  scope: Scope;
  email?: string;
  userName?: string;
}

interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantIdAzure: string;
}

interface ADConfig {
  username: string;
  password: string;
  domainFqdn: string;
  ldapHost: string;
  useSSL: boolean;
}

export default function NewWorkspacePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({
    name: '',
    slug: '',
    description: '',
    scope: 'hybrid',
    email: '',
    userName: '',
  });
  
  const [azureConfig, setAzureConfig] = useState<AzureConfig>({
    clientId: '',
    clientSecret: '',
    tenantIdAzure: '',
  });
  
  const [adConfig, setAdConfig] = useState<ADConfig>({
    username: '',
    password: '',
    domainFqdn: '',
    ldapHost: '',
    useSSL: true,
  });

  useEffect(() => {
    async function checkIfFirstSetup() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          setIsFirstSetup(true);
        } else {
          const data = await response.json();
          if (!data.tenants || data.tenants.length === 0) {
            setIsFirstSetup(true);
          }
        }
      } catch {
        setIsFirstSetup(true);
      }
    }
    
    checkIfFirstSetup();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 63);
  };

  const handleNameChange = (name: string) => {
    setWorkspaceData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleCreateWorkspace = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      let tenantId: string;
      
      if (isFirstSetup) {
        result = await fetchApi<{ token: string; tenant: { id: string } }>('/api/tenants/setup', {
          method: 'POST',
          body: workspaceData,
        });

        if (result.error || !result.data) {
          setError(result.error || 'Failed to create workspace');
          setLoading(false);
          return;
        }

        tenantId = result.data.tenant?.id;
        
        if (result.data.token) {
          const { cookies } = await import('next/headers');
          cookies().set('gb_session', result.data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
          });
        }
      } else {
        result = await fetchApi<{ id: string }>('/api/tenants', {
          method: 'POST',
          body: workspaceData,
        });

        if (result.error || !result.data) {
          setError(result.error || 'Failed to create workspace');
          setLoading(false);
          return;
        }

        tenantId = result.data.id;
      }

      if (tenantId) {
        if (workspaceData.scope === 'm365' || workspaceData.scope === 'hybrid') {
          if (azureConfig.clientId && azureConfig.clientSecret) {
            await fetchApi(`/api/tenants/${tenantId}/config/azure`, {
              method: 'POST',
              body: azureConfig,
            });
          }
        }

        if (workspaceData.scope === 'ad' || workspaceData.scope === 'hybrid') {
          if (adConfig.username && adConfig.password && adConfig.domainFqdn) {
            await fetchApi(`/api/tenants/${tenantId}/config/ad`, {
              method: 'POST',
              body: adConfig,
            });
          }
        }
      }

      router.push('/overview');
      router.refresh();
    } catch (err) {
      setError('An error occurred while creating the workspace');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScopeLabel = (scope: Scope) => {
    switch (scope) {
      case 'hybrid': return 'Hybrid';
      case 'ad': return 'AD On-Premise';
      case 'm365': return 'Microsoft 365';
    }
  };

  const getScopeDescription = (scope: Scope) => {
    switch (scope) {
      case 'hybrid': return 'Full monitoring: Active Directory On-Premise + Microsoft 365';
      case 'ad': return 'Active Directory On-Premise only';
      case 'm365': return 'Microsoft 365 only';
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">Create workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Step {step} of 3</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded border border-red-200 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Workspace name
              </label>
              <input
                type="text"
                value={workspaceData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                placeholder="My Company - Production"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                URL slug
              </label>
              <input
                type="text"
                value={workspaceData.slug}
                onChange={(e) => setWorkspaceData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                placeholder="my-company-prod"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={workspaceData.description}
                onChange={(e) => setWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors h-20 resize-none"
                placeholder="Optional description..."
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!workspaceData.name || !workspaceData.slug}
              className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Scope Selection */}
        {step === 2 && (
          <div className="space-y-3">
            {(['hybrid', 'ad', 'm365'] as Scope[]).map((scope) => (
              <button
                key={scope}
                onClick={() => setWorkspaceData(prev => ({ ...prev, scope }))}
                className={`w-full p-4 rounded-lg text-left border transition-colors ${
                  workspaceData.scope === scope
                    ? 'border-slate-400 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-medium text-slate-900">{getScopeLabel(scope)}</p>
                <p className="text-sm text-slate-500 mt-0.5">{getScopeDescription(scope)}</p>
              </button>
            ))}

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setStep(1)} 
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                className="flex-1 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Configuration */}
        {step === 3 && (
          <div className="space-y-6">
            {(workspaceData.scope === 'm365' || workspaceData.scope === 'hybrid') && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900">Microsoft 365</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={azureConfig.clientId}
                    onChange={(e) => setAzureConfig(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={azureConfig.clientSecret}
                    onChange={(e) => setAzureConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                    placeholder="Enter secret"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Tenant ID <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={azureConfig.tenantIdAzure}
                    onChange={(e) => setAzureConfig(prev => ({ ...prev, tenantIdAzure: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
              </div>
            )}

            {(workspaceData.scope === 'ad' || workspaceData.scope === 'hybrid') && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900">Active Directory</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Domain FQDN
                  </label>
                  <input
                    type="text"
                    value={adConfig.domainFqdn}
                    onChange={(e) => setAdConfig(prev => ({ ...prev, domainFqdn: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                    placeholder="contoso.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={adConfig.username}
                    onChange={(e) => setAdConfig(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                    placeholder="CONTOSO\admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adConfig.password}
                    onChange={(e) => setAdConfig(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    LDAP Host <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={adConfig.ldapHost}
                    onChange={(e) => setAdConfig(prev => ({ ...prev, ldapHost: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 transition-colors"
                    placeholder="ldap.contoso.com"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useSSL"
                    checked={adConfig.useSSL}
                    onChange={(e) => setAdConfig(prev => ({ ...prev, useSSL: e.target.checked }))}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  />
                  <label htmlFor="useSSL" className="text-sm text-slate-700">
                    Use LDAPS (SSL)
                  </label>
                </div>
              </div>
            )}

            {workspaceData.scope === 'hybrid' && (
              <p className="text-sm text-slate-500">
                Configure both types of monitoring. You can add or modify later.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setStep(2)} 
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={handleCreateWorkspace}
                disabled={loading}
                className="flex-1 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? 'Creating...' : 'Create workspace'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
