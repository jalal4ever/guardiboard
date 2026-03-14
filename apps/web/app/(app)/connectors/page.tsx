'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';

interface Connector {
  id: string;
  type: string;
  status: string;
  config: Record<string, unknown>;
  createdAt: string;
  lastCollectedAt: string | null;
}

async function getConnectors(): Promise<Connector[]> {
  const result = await fetchApi<Connector[]>('/api/connectors');
  return result.data || [];
}

export default function ConnectorsPage() {
  const connectorsData = getConnectors();

  const getConnectorName = (type: string) => {
    switch (type) {
      case 'microsoft_graph': return 'Microsoft 365';
      case 'ad_collector': return 'Active Directory';
      default: return type;
    }
  };

  const getConnectorDescription = (type: string) => {
    switch (type) {
      case 'microsoft_graph': return 'Collecte les données Microsoft 365 via Graph API';
      case 'ad_collector': return 'Collecte les données AD On-Premise';
      default: return '';
    }
  };

  const getConnectorEmoji = (type: string) => {
    switch (type) {
      case 'microsoft_graph': return '☁️';
      case 'ad_collector': return '🖥️';
      default: return '🔌';
    }
  };

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
        {connectorsData.then((connectors) => connectors.length > 0 ? connectors.map((connector) => (
          <Card key={connector.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-xl">{getConnectorEmoji(connector.type)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {getConnectorName(connector.type)}
                  </h3>
                  <p className="text-sm text-slate-500">{getConnectorDescription(connector.type)}</p>
                </div>
              </div>
              <Badge variant={connector.status === 'authorized' || connector.status === 'collecting' ? 'success' : 'warning'}>
                {connector.status === 'authorized' ? 'Actif' : connector.status === 'collecting' ? 'En cours' : connector.status === 'pending' ? 'En attente' : connector.status === 'error' ? 'Erreur' : connector.status}
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">
              <div>
                <p className="text-xs text-slate-500">Dernière collecte</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {connector.lastCollectedAt ? new Date(connector.lastCollectedAt).toLocaleString('fr-FR') : 'Jamais'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Créé le</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {new Date(connector.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Santé</p>
                <p className="mt-1 text-sm font-medium text-green-600">
                  ✓ Bon
                </p>
              </div>
            </div>

            {connector.type === 'microsoft_graph' && connector.config && typeof connector.config === 'object' && 'azureTenantId' in connector.config && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-500 mb-2">Tenant Azure</p>
                <p className="text-sm font-mono text-slate-700">{(connector.config as any).azureTenantId}</p>
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
        )) : (
          <div className="col-span-2 text-center py-12 text-slate-500">
            <p className="text-lg">Aucun connecteur configuré</p>
            <p className="text-sm mt-1">Ajoutez un connecteur pour commencer la collecte</p>
          </div>
        ))}
      </div>
    </div>
  );
}
