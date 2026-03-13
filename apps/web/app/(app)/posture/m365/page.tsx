import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const checks = [
  { title: 'MFA', score: 84, status: 'Bon' },
  { title: 'Conditional Access', score: 79, status: 'A surveiller' },
  { title: 'Applications', score: 73, status: 'A surveiller' },
  { title: 'Secure Score', score: 81, status: 'Bon' },
];

export default function PostureM365Page() {
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
