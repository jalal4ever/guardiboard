import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue d'ensemble de la posture de sécurité
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Score Global</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">78%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-lg">✓</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">+3%</span>
            <span className="ml-2 text-slate-500">depuis 30 jours</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Findings Critiques</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">12</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-lg text-red-600">!</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600">+2</span>
            <span className="ml-2 text-slate-500">cette semaine</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Utilisateurs</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">1,247</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">dont 23 privilégiés</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Applications</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">89</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg">📦</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">42 consentement admin</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Score par Domaine</h2>
          <div className="space-y-4">
            {[
              { name: 'Microsoft 365', score: 85, color: 'bg-green-500' },
              { name: 'Active Directory', score: 72, color: 'bg-yellow-500' },
              { name: 'Identités', score: 68, color: 'bg-orange-500' },
              { name: 'Applications', score: 91, color: 'bg-green-500' },
            ].map((domain) => (
              <div key={domain.name} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-600">{domain.name}</div>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${domain.color} rounded-full`}
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
          <div className="space-y-3">
            {[
              { title: 'Compte sans MFA', severity: 'critical', time: '2h ago' },
              { title: 'Delegation Kerberos', severity: 'high', time: '5h ago' },
              { title: 'Groupe vide', severity: 'low', time: '1j ago' },
              { title: 'Politique mot de passe faible', severity: 'medium', time: '2j ago' },
            ].map((finding, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Badge variant={finding.severity as any}>{finding.severity}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {finding.title}
                  </p>
                </div>
                <span className="text-xs text-slate-500">{finding.time}</span>
              </div>
            ))}
          </div>
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
                <th className="pb-3 text-left text-xs font-semibold text-slate-500 uppercase">Objets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 text-sm text-slate-900">Microsoft Graph</td>
                <td className="py-3"><Badge variant="success">Actif</Badge></td>
                <td className="py-3 text-sm text-slate-500">Il y a 15 min</td>
                <td className="py-3 text-sm text-slate-500">1,247</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-slate-900">AD Collector</td>
                <td className="py-3"><Badge variant="success">Actif</Badge></td>
                <td className="py-3 text-sm text-slate-500">Il y a 1h</td>
                <td className="py-3 text-sm text-slate-500">892</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
