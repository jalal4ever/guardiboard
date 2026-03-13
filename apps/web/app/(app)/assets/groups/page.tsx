'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const groups = [
  { id: '1', name: 'Domain Admins', type: 'security', members: 3, privileged: true },
  { id: '2', name: 'Enterprise Admins', type: 'security', members: 1, privileged: true },
  { id: '3', name: 'IT Support', type: 'security', members: 5, privileged: false },
  { id: '4', name: 'All Employees', type: 'distribution', members: 245, privileged: false },
  { id: '5', name: 'External Consultants', type: 'security', members: 0, privileged: false },
];

export default function AssetsGroupsPage() {
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
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <p className="text-sm font-medium text-slate-900">{group.name}</p>
                  </td>
                  <td className="py-3">
                    <Badge variant={group.type === 'security' ? 'info' : 'default'}>
                      {group.type === 'security' ? 'Sécurité' : 'Distribution'}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-slate-900">{group.members}</td>
                  <td className="py-3">
                    {group.privileged && <Badge variant="warning">Privilégié</Badge>}
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
