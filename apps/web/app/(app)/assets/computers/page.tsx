'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const computers = [
  { id: '1', name: 'SRV-DC-01', os: 'Windows Server 2022', domain: 'contoso.com', privileged: true },
  { id: '2', name: 'SRV-WEB-01', os: 'Windows Server 2019', domain: 'contoso.com', privileged: false },
  { id: '3', name: 'SRV-SQL-01', os: 'Windows Server 2022', domain: 'contoso.com', privileged: true },
  { id: '4', name: 'WS-FIN-001', os: 'Windows 11', domain: 'contoso.com', privileged: false },
  { id: '5', name: 'WS-IT-001', os: 'Windows 10', domain: 'contoso.com', privileged: false },
];

export default function AssetsComputersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ordinateurs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inventaire des ordinateurs Active Directory
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
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Ordinateur</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">OS</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Domaine</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {computers.map((computer) => (
                <tr key={computer.id} className="hover:bg-slate-50">
                  <td className="py-3">
                    <p className="text-sm font-medium text-slate-900">{computer.name}</p>
                  </td>
                  <td className="py-3 text-sm text-slate-600">{computer.os}</td>
                  <td className="py-3 text-sm text-slate-600">{computer.domain}</td>
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
