'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';

type Scope = 'hybrid' | 'ad' | 'm365';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope: Scope;
  isActive: boolean;
}

interface AzureConfig {
  isConfigured: boolean;
  clientId?: string;
  tenantIdAzure?: string;
  consentGranted: boolean;
}

interface ADConfig {
  isConfigured: boolean;
  username?: string;
  domainFqdn?: string;
  ldapHost?: string;
  useSSL: boolean;
  lastTestAt: string | null;
  lastTestSuccess: boolean | null;
}

export default function SettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [azureConfig, setAzureConfig] = useState<AzureConfig | null>(null);
  const [adConfig, setADConfig] = useState<ADConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editScope, setEditScope] = useState<Scope>('hybrid');

  const [newAzureClientId, setNewAzureClientId] = useState('');
  const [newAzureClientSecret, setNewAzureClientSecret] = useState('');
  const [newAzureTenantId, setNewAzureTenantId] = useState('');

  const [newADUsername, setNewADUsername] = useState('');
  const [newADPassword, setNewADPassword] = useState('');
  const [newADDomain, setNewADDomain] = useState('');
  const [newADLdapHost, setNewADLdapHost] = useState('');
  const [newADUseSSL, setNewADUseSSL] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionResult = await fetchApi<{ currentTenant: Tenant }>('/api/auth/me');
        if (!sessionResult.data?.currentTenant) {
          setLoading(false);
          return;
        }

        const t = sessionResult.data.currentTenant;
        setTenant(t);
        setEditName(t.name);
        setEditDescription(t.description || '');
        setEditScope(t.scope as Scope);

        const [azure, ad] = await Promise.all([
          fetchApi<AzureConfig>(`/api/tenants/${t.id}/config/azure`),
          fetchApi<ADConfig>(`/api/tenants/${t.id}/config/ad`),
        ]);

        setAzureConfig(azure.data || null);
        setADConfig(ad.data || null);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSaveWorkspace = async () => {
    if (!tenant) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const result = await fetchApi(`/api/tenants/${tenant.id}`, {
        method: 'PATCH',
        body: {
          name: editName,
          description: editDescription,
          scope: editScope,
        },
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Settings saved' });
        setTenant(prev => prev ? { ...prev, name: editName, description: editDescription, scope: editScope } : null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAzureConfig = async () => {
    if (!tenant || !newAzureClientId || !newAzureClientSecret) return;

    setSaving(true);
    setMessage(null);

    try {
      const result = await fetchApi(`/api/tenants/${tenant.id}/config/azure`, {
        method: 'POST',
        body: {
          clientId: newAzureClientId,
          clientSecret: newAzureClientSecret,
          tenantIdAzure: newAzureTenantId || undefined,
        },
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Azure configuration saved' });
        setNewAzureClientId('');
        setNewAzureClientSecret('');
        setNewAzureTenantId('');
        
        const updated = await fetchApi<AzureConfig>(`/api/tenants/${tenant.id}/config/azure`);
        setAzureConfig(updated.data || null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAzureConfig = async () => {
    if (!tenant) return;
    if (!confirm('Are you sure you want to remove Azure configuration?')) return;

    try {
      await fetchApi(`/api/tenants/${tenant.id}/config/azure`, { method: 'DELETE' });
      setAzureConfig(null);
      setMessage({ type: 'success', text: 'Azure configuration removed' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error removing' });
    }
  };

  const handleSaveADConfig = async () => {
    if (!tenant || !newADUsername || !newADPassword || !newADDomain) return;

    setSaving(true);
    setMessage(null);

    try {
      const result = await fetchApi(`/api/tenants/${tenant.id}/config/ad`, {
        method: 'POST',
        body: {
          username: newADUsername,
          password: newADPassword,
          domainFqdn: newADDomain,
          ldapHost: newADLdapHost || undefined,
          useSSL: newADUseSSL,
        },
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'AD configuration saved' });
        setNewADUsername('');
        setNewADPassword('');
        setNewADDomain('');
        setNewADLdapHost('');
        
        const updated = await fetchApi<ADConfig>(`/api/tenants/${tenant.id}/config/ad`);
        setADConfig(updated.data || null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteADConfig = async () => {
    if (!tenant) return;
    if (!confirm('Are you sure you want to remove AD configuration?')) return;

    try {
      await fetchApi(`/api/tenants/${tenant.id}/config/ad`, { method: 'DELETE' });
      setADConfig(null);
      setMessage({ type: 'success', text: 'AD configuration removed' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error removing' });
    }
  };

  const handleTestADConnection = async () => {
    if (!tenant) return;

    setSaving(true);
    try {
      const result = await fetchApi(`/api/tenants/${tenant.id}/config/ad/test`, { method: 'POST' });
      if (result.error) {
        setMessage({ type: 'error', text: 'Test failed' });
      } else {
        setMessage({ type: 'success', text: 'Connection test successful' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error testing' });
    } finally {
      setSaving(false);
    }
  };

  const getScopeLabel = (scope: Scope) => {
    switch (scope) {
      case 'hybrid': return 'Hybrid';
      case 'ad': return 'AD On-Premise';
      case 'm365': return 'Microsoft 365';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No workspace selected</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure your monitoring workspace
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-900">General</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Name</label>
            <input
              className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all h-20 resize-none"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Scope</label>
            <select
              className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
              value={editScope}
              onChange={(e) => setEditScope(e.target.value as Scope)}
            >
              <option value="hybrid">Hybrid (AD + M365)</option>
              <option value="ad">AD On-Premise only</option>
              <option value="m365">Microsoft 365 only</option>
            </select>
          </div>
          <button
            onClick={handleSaveWorkspace}
            disabled={saving}
            className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-900">Microsoft 365</h2>
          {azureConfig?.isConfigured && (
            <Badge variant={azureConfig.consentGranted ? 'success' : 'warning'}>
              {azureConfig.consentGranted ? 'Configured' : 'Pending'}
            </Badge>
          )}
        </div>
        
        {azureConfig?.isConfigured ? (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-slate-500">Client ID:</span>
              <span className="ml-2 font-mono text-slate-700">{azureConfig.clientId}</span>
            </div>
            {azureConfig.tenantIdAzure && (
              <div className="text-sm">
                <span className="text-slate-500">Tenant ID:</span>
                <span className="ml-2 font-mono text-slate-700">{azureConfig.tenantIdAzure}</span>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button className="text-sm text-slate-600 hover:text-slate-900">Test</button>
              <button onClick={handleDeleteAzureConfig} className="text-sm text-red-600 hover:text-red-700">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Configure Azure credentials for Microsoft 365 monitoring
            </p>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Client ID</label>
              <input
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
                value={newAzureClientId}
                onChange={(e) => setNewAzureClientId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Client Secret</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
                value={newAzureClientSecret}
                onChange={(e) => setNewAzureClientSecret(e.target.value)}
                placeholder="••••••••••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Tenant ID <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
                value={newAzureTenantId}
                onChange={(e) => setNewAzureTenantId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <button
              onClick={handleSaveAzureConfig}
              disabled={saving || !newAzureClientId || !newAzureClientSecret}
              className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-900">Active Directory</h2>
          {adConfig?.isConfigured && (
            <Badge variant={adConfig.lastTestSuccess ? 'success' : adConfig.lastTestSuccess === false ? 'error' : 'warning'}>
              {adConfig.lastTestSuccess ? 'Connected' : adConfig.lastTestSuccess === false ? 'Error' : 'Not tested'}
            </Badge>
          )}
        </div>
        
        {adConfig?.isConfigured ? (
          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-slate-500">Username:</span>
              <span className="ml-2 font-mono text-slate-700">{adConfig.username}</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Domain:</span>
              <span className="ml-2 font-mono text-slate-700">{adConfig.domainFqdn}</span>
            </div>
            {adConfig.ldapHost && (
              <div className="text-sm">
                <span className="text-slate-500">LDAP Host:</span>
                <span className="ml-2 font-mono text-slate-700">{adConfig.ldapHost}</span>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={handleTestADConnection} className="text-sm text-slate-600 hover:text-slate-900">
                Test
              </button>
              <button onClick={handleDeleteADConfig} className="text-sm text-red-600 hover:text-red-700">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Configure service account for AD On-Premise monitoring
            </p>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Domain FQDN</label>
              <input
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
                value={newADDomain}
                onChange={(e) => setNewADDomain(e.target.value)}
                placeholder="contoso.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Username</label>
              <input
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
                value={newADUsername}
                onChange={(e) => setNewADUsername(e.target.value)}
                placeholder="CONTOSO\admin"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
                value={newADPassword}
                onChange={(e) => setNewADPassword(e.target.value)}
                placeholder="••••••••••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">LDAP Host <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                className="w-full px-3 py-2 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-accent-500 focus:bg-white outline-none transition-all"
                value={newADLdapHost}
                onChange={(e) => setNewADLdapHost(e.target.value)}
                placeholder="ldap.contoso.com"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useSSL"
                checked={newADUseSSL}
                onChange={(e) => setNewADUseSSL(e.target.checked)}
                className="rounded border-slate-300 text-accent-600 focus:ring-accent-500"
              />
              <label htmlFor="useSSL" className="text-sm text-slate-700">Use LDAPS (SSL)</label>
            </div>
            <button
              onClick={handleSaveADConfig}
              disabled={saving || !newADUsername || !newADPassword || !newADDomain}
              className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
