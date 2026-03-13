import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const correlations = [
  { title: 'Comptes sync AD sans MFA', count: 14, severity: 'high' },
  { title: 'Groupes privilegies sync', count: 7, severity: 'medium' },
  { title: 'Admins cloud sans compte on-prem', count: 3, severity: 'low' },
];

export default function PostureHybridPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Posture Hybride</h1>
        <p className="mt-1 text-sm text-slate-500">
          Correlations AD + M365 et ecarts critiques
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {correlations.map((item) => (
          <Card key={item.title}>
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{item.count}</p>
            <div className="mt-3">
              <Badge variant={item.severity as any}>{item.severity}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Ecarts principaux</h2>
        <div className="space-y-3">
          {[
            'Identites sync AD sans policy CA appliquee',
            'Groupes privileges hybrides sans revue recente',
            'Applications cloud avec comptes AD privilegies',
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
