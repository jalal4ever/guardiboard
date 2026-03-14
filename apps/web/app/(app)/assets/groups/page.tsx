'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';

interface IdentityGroup {
  id: string;
  displayName: string | null;
  mail: string | null;
  groupTypes: string[];
  isPrivileged: boolean;
  memberCount: number | null;
  source: string;
  lastSeenAt: string | null;
}

interface GroupsResponse {
  groups: IdentityGroup[];
  total: number;
}

async function getGroups(): Promise<GroupsResponse> {
  const result = await fetchApi<GroupsResponse>('/api/assets/groups');
  return result.data || { groups: [], total: 0 };
}

export default function AssetsGroupsPage() {
  const groupsData = getGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Groupes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inventaire des groupes Active Directory et Microsoft 365
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
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Groupe</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Membres</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Privilégié</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {groupsData.then(({ groups }) => groups.length > 0 ? groups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <p className="text-sm font-medium text-slate-900">{group.displayName || group.mail}</p>
                  </td>
                  <td className="py-3">
                    <Badge variant={group.groupTypes?.includes('SecurityEnabled') ? 'info' : 'default'}>
                      {group.groupTypes?.includes('SecurityEnabled') ? 'Sécurité' : 'Distribution'}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-slate-900">{group.memberCount ?? 0}</td>
                  <td className="py-3">
                    {group.isPrivileged && <Badge variant="warning">Privilégié</Badge>}
                  </td>
                  <td className="py-3">
                    <button className="text-sm text-accent-600 hover:text-accent-700">Voir</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Aucun groupe trouvé
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
