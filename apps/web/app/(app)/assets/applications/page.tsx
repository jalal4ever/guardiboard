'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const apps = [
  { id: '1', name: 'Microsoft 365', publisher: 'Microsoft', users: 1247, risk: 'low' },
  { id: '2', name: 'Salesforce', publisher: 'Salesforce', users: 89, risk: 'medium' },
  { id: '3', name: 'Slack', publisher: 'Slack', users: 234, risk: 'low' },
  { id: '4', name: 'Custom App', publisher: 'Contoso', users: 12, risk: 'high' },
];

export default function AssetsApplicationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Applications d'entreprise et service principals
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
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Application</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Editeur</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Utilisateurs</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Risque</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <p className="text-sm font-medium text-slate-900">{app.name}</p>
                  </td>
                  <td className="py-3 text-sm text-slate-600">{app.publisher}</td>
                  <td className="py-3 text-sm text-slate-900">{app.users}</td>
                  <td className="py-3">
                    <Badge variant={app.risk === 'low' ? 'success' : app.risk === 'medium' ? 'warning' : 'error'}>
                      {app.risk}
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
