'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  source: string;
  assetType: string;
  assetId: string;
  createdAt: string;
}

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function fetchFindings() {
      try {
        const params = new URLSearchParams();
        if (severityFilter) params.set('severity', severityFilter);
        if (statusFilter) params.set('status', statusFilter);
        params.set('limit', '50');

        const response = await fetch(`/api/findings?${params}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load findings');
          return;
        }

        setFindings(data.findings || []);
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFindings();
  }, [severityFilter, statusFilter]);

  const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];

  const filteredFindings = [...findings].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Findings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Anomalies et problèmes de sécurité détectés
            </p>
          </div>
        </div>
        <div className="text-center py-12 text-slate-500">Chargement...</div>
      </div>
    );
  }

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
          <select 
            className="input w-40"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">Sévérité</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select 
            className="input w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Statut</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600">{error}</div>
      )}

      <div className="grid gap-4">
        {filteredFindings.map((finding) => (
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

      {filteredFindings.length === 0 && !error && (
        <div className="text-center py-12 text-slate-500">
          Aucun finding trouvé
        </div>
      )}

      <div className="flex justify-center">
        <button className="btn-secondary">
          Charger plus de résultats
        </button>
      </div>
    </div>
  );
}
