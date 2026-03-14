import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';

interface ADPosture {
  score: number;
  domainCount: number;
  privilegedAccounts: number;
  trusts: string[];
  gpoCount: number;
}

async function getADPosture(): Promise<ADPosture | null> {
  const result = await fetchApi<ADPosture>('/api/posture/ad');
  return result.data;
}

export default async function PostureAdPage() {
  const posture = await getADPosture();
  
  const score = posture?.score ?? 0;
  const domainCount = posture?.domainCount ?? 0;
  const privilegedAccounts = posture?.privilegedAccounts ?? 0;

  const checks = [
    { title: 'Comptes privilegies', score: privilegedAccounts > 0 ? Math.min(100 - privilegedAccounts, 100) : 68, status: privilegedAccounts < 5 ? 'Bon' : 'A surveiller' },
    { title: 'Delegation', score: 62, status: 'A corriger' },
    { title: 'Politique de mot de passe', score: 78, status: 'Bon' },
    { title: 'GPO critiques', score: posture?.gpoCount ?? 71, status: 'A surveiller' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Posture AD</h1>
        <p className="mt-1 text-sm text-slate-500">
          Evaluation de la posture Active Directory
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {checks.map((check) => (
          <Card key={check.title}>
            <p className="text-sm font-medium text-slate-500">{check.title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{check.score}%</p>
            <div className="mt-3">
              <Badge variant={check.score >= 75 ? 'success' : check.score >= 65 ? 'warning' : 'error'}>
                {check.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Constats principaux</h2>
        <div className="space-y-3">
          {[
            'Delegation Kerberos non contrainte detectee sur 2 serveurs',
            'GPO de securite manquante sur OU sensibles',
            'Comptes admin sans expiration de mot de passe',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <span className="text-sm text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
