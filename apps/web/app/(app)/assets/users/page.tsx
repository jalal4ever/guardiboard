'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';

interface IdentityUser {
  id: string;
  displayName: string | null;
  userPrincipalName: string | null;
  mail: string | null;
  accountEnabled: boolean;
  isPrivileged: boolean;
  mfaEnabled: boolean | null;
  source: string;
  lastSeenAt: string | null;
}

interface UsersResponse {
  users: IdentityUser[];
  total: number;
}

async function getUsers(): Promise<UsersResponse> {
  const result = await fetchApi<UsersResponse>('/api/assets/users');
  return result.data || { users: [], total: 0 };
}

export default function AssetsUsersPage() {
  const usersData = getUsers();

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
              {usersData.then(({ users }) => users.length > 0 ? users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.displayName || user.userPrincipalName}</p>
                      <p className="text-xs text-slate-500">{user.mail || user.userPrincipalName}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge variant={user.accountEnabled ? 'success' : 'default'}>
                      {user.accountEnabled ? 'Actif' : 'Désactivé'}
                    </Badge>
                  </td>
                  <td className="py-3">
                    {user.isPrivileged && <Badge variant="warning">Privilégié</Badge>}
                  </td>
                  <td className="py-3">
                    {user.mfaEnabled !== null && (
                      <Badge variant={user.mfaEnabled ? 'success' : 'error'}>
                        {user.mfaEnabled ? 'Activé' : 'Désactivé'}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3">
                    <button className="text-sm text-accent-600 hover:text-accent-700">Voir</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Aucun utilisateur trouvé
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
