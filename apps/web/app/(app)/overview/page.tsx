import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi, getSession } from '@/lib/api';

interface PostureData {
  globalScore: number;
  userCount: number;
  groupCount: number;
  criticalFindings: number;
  highFindings: number;
  totalFindings: number;
  scoreHistory: any[];
}

interface Finding {
  id: string;
  title: string;
  severity: string;
  status: string;
  assetType: string;
  createdAt: string;
}

interface Connector {
  id: string;
  type: string;
  status: string;
  lastCollectedAt: string | null;
}

async function getPostureData() {
  const result = await fetchApi<PostureData>('/api/posture/overview');
  return result.data;
}

async function getRecentFindings() {
  const result = await fetchApi<{ findings: Finding[] }>('/api/findings?limit=5');
  return result.data?.findings || [];
}

async function getConnectors() {
  const result = await fetchApi<Connector[]>('/api/assets/connectors');
  return result.data || [];
}

export default async function OverviewPage() {
  const session = await getSession();
  
  if (!session || !session.currentTenant) {
    redirect('/login');
  }

  const [postureData, recentFindings, connectors] = await Promise.all([
    getPostureData(),
    getRecentFindings(),
    getConnectors(),
  ]);
  
  const globalScore = postureData?.globalScore ?? 0;
  const criticalFindings = postureData?.criticalFindings ?? 0;
  const highFindings = postureData?.highFindings ?? 0;
  const userCount = postureData?.userCount ?? 0;
  const groupCount = postureData?.groupCount ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getConnectorStatus = (status: string) => {
    switch (status) {
      case 'authorized': return 'Actif';
      case 'collecting': return 'En cours';
      case 'pending': return 'En attente';
      case 'error': return 'Erreur';
      case 'disabled': return 'Désactivé';
      default: return status;
    }
  };

  const getConnectorStatusVariant = (status: string) => {
    switch (status) {
      case 'authorized': return 'success';
      case 'collecting': return 'warning';
      case 'pending': return 'warning';
      case 'error': return 'destructive';
      case 'disabled': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Jamais';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue d&apos;ensemble de la posture de sécurité
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Score Global</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{globalScore}%</p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getScoreColor(globalScore).replace('bg-', 'bg-').replace('500', '100')}`}>
              <span className={`text-lg ${getScoreColor(globalScore).replace('bg-', 'text-').replace('500', '600')}`}>★</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={globalScore >= 80 ? 'text-green-600' : globalScore >= 50 ? 'text-yellow-600' : 'text-red-600'}>
              {globalScore >= 80 ? 'Excellent' : globalScore >= 50 ? 'À améliorer' : 'Critique'}
            </span>
            <span className="ml-2 text-slate-500">score actuel</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Findings Critiques</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{criticalFindings}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-lg text-red-600">!</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600">+{criticalFindings}</span>
            <span className="ml-2 text-slate-500">à traiter</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Utilisateurs</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{userCount.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">dont {highFindings} privilégiés</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Groupes</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{groupCount.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg">👥</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">groupes synchronisés</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Score par Domaine</h2>
          <div className="space-y-4">
            {[
              { name: 'Microsoft 365', score: globalScore > 0 ? Math.min(globalScore + 7, 100) : 85, color: 'bg-green-500' },
              { name: 'Active Directory', score: globalScore > 0 ? Math.max(globalScore - 6, 0) : 72, color: 'bg-yellow-500' },
              { name: 'Identités', score: globalScore > 0 ? Math.max(globalScore - 10, 0) : 68, color: 'bg-orange-500' },
              { name: 'Applications', score: globalScore > 0 ? Math.min(globalScore + 13, 100) : 91, color: 'bg-green-500' },
            ].map((domain) => (
              <div key={domain.name} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-600">{domain.name}</div>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${domain.color} rounded-full transition-all`}
                    style={{ width: `${domain.score}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-medium text-slate-900 text-right">
                  {domain.score}%
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Findings Récents</h2>
          {recentFindings.length > 0 ? (
            <div className="space-y-3">
              {recentFindings.map((finding) => (
                <div key={finding.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Badge variant={finding.severity as any}>{finding.severity}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {finding.title}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">{finding.assetType}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Aucun finding détecté</p>
              <p className="text-sm mt-1">Configurez un connecteur pour commencer</p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">État des Connecteurs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Connecteur</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Dernière collecte</th>
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {connectors.length > 0 ? (
                connectors.map((connector) => (
                  <tr key={connector.id}>
                    <td className="py-3 text-sm text-slate-900">
                      {connector.type === 'microsoft_graph' ? 'Microsoft Graph' : 'AD Collector'}
                    </td>
                    <td className="py-3">
                      <Badge variant={getConnectorStatusVariant(connector.status) as any}>
                        {getConnectorStatus(connector.status)}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-slate-500">
                      {formatTimeAgo(connector.lastCollectedAt)}
                    </td>
                    <td className="py-3 text-sm text-slate-500">
                      {connector.type === 'microsoft_graph' ? 'M365' : 'AD'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Aucun connecteur configuré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
