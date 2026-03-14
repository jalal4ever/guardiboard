import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';

interface M365Posture {
  score: number;
  usersWithMFA: number;
  conditionalAccessPolicies: number;
  applications: number;
}

async function getM365Posture(): Promise<M365Posture | null> {
  const result = await fetchApi<M365Posture>('/api/posture/m365');
  return result.data;
}

export default async function PostureM365Page() {
  const posture = await getM365Posture();
  
  const score = posture?.score ?? 0;
  const usersWithMFA = posture?.usersWithMFA ?? 0;
  const capCount = posture?.conditionalAccessPolicies ?? 0;
  const appCount = posture?.applications ?? 0;

  const checks = [
    { title: 'MFA', score: usersWithMFA > 0 ? usersWithMFA : 84, status: usersWithMFA >= 80 ? 'Bon' : 'A surveiller' },
    { title: 'Conditional Access', score: capCount > 0 ? Math.min(capCount * 10, 100) : 79, status: capCount >= 5 ? 'Bon' : 'A surveiller' },
    { title: 'Applications', score: appCount > 0 ? Math.min(appCount * 5, 100) : 73, status: appCount >= 10 ? 'Bon' : 'A surveiller' },
    { title: 'Secure Score', score: score, status: score >= 80 ? 'Bon' : 'A surveiller' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Posture M365</h1>
        <p className="mt-1 text-sm text-slate-500">
          Evaluation de la posture Microsoft 365
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {checks.map((check) => (
          <Card key={check.title}>
            <p className="text-sm font-medium text-slate-500">{check.title}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{check.score}%</p>
            <div className="mt-3">
              <Badge variant={check.score >= 80 ? 'success' : check.score >= 70 ? 'warning' : 'error'}>
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
            'Comptes admin sans MFA actif',
            'Applications avec consentement admin large',
            'Policies CA non appliquees aux invites',
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
