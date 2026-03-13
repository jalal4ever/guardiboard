'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';

const assetTypes = [
  { 
    name: 'Utilisateurs', 
    count: 1247, 
    href: '/assets/users',
    icon: '👤',
    description: 'Utilisateurs AD et M365'
  },
  { 
    name: 'Groupes', 
    count: 89, 
    href: '/assets/groups',
    icon: '👥',
    description: 'Groupes de sécurité et distribution'
  },
  { 
    name: 'Ordinateurs', 
    count: 456, 
    href: '/assets/computers',
    icon: '🖥️',
    description: 'Machines jointe au domaine'
  },
  { 
    name: 'Applications', 
    count: 234, 
    href: '/assets/applications',
    icon: '📦',
    description: 'Applications d\'entreprise et service principals'
  },
];

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Actifs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inventaire unifié de vos environnements
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="search" 
            placeholder="Rechercher dans les actifs..." 
            className="input w-80"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {assetTypes.map((asset) => (
          <Link key={asset.name} href={asset.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl">
                  {asset.icon}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{asset.count.toLocaleString('fr-FR')}</p>
                  <p className="text-sm font-medium text-slate-700">{asset.name}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">{asset.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recherche recente</h2>
        <div className="space-y-2">
          {[
            'admin@contoso.com',
            'Domain Admins',
            'SRV-DC-01',
            'Applications OAuth',
          ].map((query) => (
            <div key={query} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer">
              <span className="text-slate-400">🔍</span>
              <span className="text-sm text-slate-700">{query}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
