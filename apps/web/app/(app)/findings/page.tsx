'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const findings = [
  {
    id: '1',
    title: 'Compte utilisateur sans MFA',
    description: 'Le compte admin@contoso.com n\'a pas d\'authentification multifacteur activée',
    severity: 'critical',
    status: 'open',
    source: 'microsoft_graph',
    assetType: 'user',
    assetId: 'admin@contoso.com',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '2',
    title: 'Délégation Kerberos non contrainte détectée',
    description: 'Le serveur SRV-WEB-01 est configuré avec une délégation Kerberos non contrainte',
    severity: 'high',
    status: 'open',
    source: 'ad_collector',
    assetType: 'computer',
    assetId: 'SRV-WEB-01',
    createdAt: '2024-01-14T14:30:00Z',
  },
  {
    id: '3',
    title: 'Groupe de sécurité vide',
    description: 'Le groupe "External Consultants" n\'a aucun membre',
    severity: 'low',
    status: 'open',
    source: 'ad_collector',
    assetType: 'group',
    assetId: 'External Consultants',
    createdAt: '2024-01-13T10:00:00Z',
  },
  {
    id: '4',
    title: 'Politique de mot de passe faible',
    description: 'La politique de mot de passe permet des mots de passe de moins de 8 caractères',
    severity: 'medium',
    status: 'in_progress',
    source: 'ad_collector',
    assetType: 'policy',
    assetId: 'Default Domain Policy',
    createdAt: '2024-01-12T09:15:00Z',
  },
];

export default function FindingsPage() {
  const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Findings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Anomalies et problèmes de sécurité détectés
          </p>
        </div>
        <div className="flex gap-2">
          <select className="input w-40">
            <option value="">Sévérité</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="input w-40">
            <option value="">Statut</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {findings
          .sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
          .map((finding) => (
            <Card key={finding.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Badge variant={finding.severity as any}>
                  {finding.severity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {finding.title}
                    </h3>
                    <Badge variant={finding.status === 'open' ? 'warning' : 'info'}>
                      {finding.status === 'open' ? 'Ouvert' : 'En cours'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {finding.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span>Source: {finding.source === 'microsoft_graph' ? 'M365' : 'AD'}</span>
                    <span>Actif: {finding.assetType} / {finding.assetId}</span>
                    <span>Créé: {new Date(finding.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <button className="btn-secondary text-sm">
                  Voir
                </button>
              </div>
            </Card>
          ))}
      </div>

      <div className="flex justify-center">
        <button className="btn-secondary">
          Charger plus de résultats
        </button>
      </div>
    </div>
  );
}
