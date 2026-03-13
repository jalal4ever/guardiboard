'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const users = [
  { id: '1', name: 'Admin Contoso', email: 'admin@contoso.com', status: 'active', privileged: true, mfa: true },
  { id: '2', name: 'John Doe', email: 'john.doe@contoso.com', status: 'active', privileged: false, mfa: true },
  { id: '3', name: 'Jane Smith', email: 'jane.smith@contoso.com', status: 'active', privileged: false, mfa: false },
  { id: '4', name: 'Service Account SA-SQL', email: 'sa-sql@contoso.com', status: 'active', privileged: true, mfa: false },
  { id: '5', name: 'Former Employee', email: 'former@contoso.com', status: 'disabled', privileged: false, mfa: false },
];

export default function AssetsUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inventaire des utilisateurs Active Directory et Microsoft 365
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="search" 
            placeholder="Rechercher..." 
            className="input w-64"
          />
          <button className="btn-secondary">Exporter</button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Privilégié</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">MFA</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                      {user.status === 'active' ? 'Actif' : 'Désactivé'}
                    </Badge>
                  </td>
                  <td className="py-3">
                    {user.privileged && <Badge variant="warning">Privilégié</Badge>}
                  </td>
                  <td className="py-3">
                    <Badge variant={user.mfa ? 'success' : 'error'}>
                      {user.mfa ? 'Activé' : 'Désactivé'}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <button className="text-sm text-accent-600 hover:text-accent-700">Voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
