'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const connectors = [
  {
    id: '1',
    type: 'microsoft_graph',
    name: 'Microsoft 365',
    description: 'Collecte les données Microsoft 365 via Graph API',
    status: 'collecting',
    lastCollected: '2024-01-15T10:30:00Z',
    itemsCollected: 1247,
    scopes: ['User.Read.All', 'Group.Read.All', 'Directory.Read.All'],
  },
  {
    id: '2',
    type: 'ad_collector',
    name: 'Active Directory',
    description: 'Collecte les données AD On-Premise',
    status: 'collecting',
    lastCollected: '2024-01-15T09:00:00Z',
    itemsCollected: 892,
    domains: ['contoso.com'],
  },
];

export default function ConnectorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Connecteurs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez vos connecteurs de données
          </p>
        </div>
        <button className="btn-primary">
          Ajouter un connecteur
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {connectors.map((connector) => (
          <Card key={connector.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                  {connector.type === 'microsoft_graph' ? (
                    <span className="text-xl">☁️</span>
                  ) : (
                    <span className="text-xl">🖥️</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {connector.name}
                  </h3>
                  <p className="text-sm text-slate-500">{connector.description}</p>
                </div>
              </div>
              <Badge variant={connector.status === 'collecting' ? 'success' : 'warning'}>
                {connector.status === 'collecting' ? 'Actif' : 'En attente'}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">
              <div>
                <p className="text-xs text-slate-500">Dernière collecte</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {new Date(connector.lastCollected).toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Objets collectés</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {connector.itemsCollected.toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Santé</p>
                <p className="mt-1 text-sm font-medium text-green-600">
                  ✓ Bon
                </p>
              </div>
            </div>

            {connector.scopes && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-500 mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1">
                  {connector.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
              <button className="btn-secondary text-sm">
                Configurer
              </button>
              <button className="btn-secondary text-sm">
                Relancer
              </button>
              <button className="text-sm text-red-600 hover:text-red-700">
                Désactiver
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
