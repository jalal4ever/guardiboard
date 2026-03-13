import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const postureCards = [
  {
    title: 'Microsoft 365',
    score: 85,
    change: '+4%',
    status: 'Bon',
    href: '/posture/m365',
    color: 'bg-emerald-100',
  },
  {
    title: 'Active Directory',
    score: 72,
    change: '+1%',
    status: 'A surveiller',
    href: '/posture/ad',
    color: 'bg-amber-100',
  },
  {
    title: 'Hybride',
    score: 78,
    change: '+2%',
    status: 'En progression',
    href: '/posture/hybrid',
    color: 'bg-sky-100',
  },
];

const priorities = [
  { title: 'MFA incomplet sur comptes admin', severity: 'critical', scope: 'm365' },
  { title: 'Delegation Kerberos non contrainte', severity: 'high', scope: 'ad' },
  { title: 'Application avec consentement large', severity: 'medium', scope: 'm365' },
  { title: 'GPO critique non appliquee', severity: 'medium', scope: 'ad' },
];

export default function PosturePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Posture</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scores, tendances et priorites de securite
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary">Exporter</button>
          <button className="btn-primary">Rapport</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {postureCards.map((card) => (
          <Card key={card.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{card.score}%</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-emerald-600 text-sm">{card.change}</span>
                  <span className="text-slate-500 text-sm">depuis 30 jours</span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-lg ${card.color}`}>
                <div className="h-full w-full flex items-center justify-center text-slate-700">
                  {card.title === 'Microsoft 365' && '☁️'}
                  {card.title === 'Active Directory' && '🖥️'}
                  {card.title === 'Hybride' && '🔗'}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant={card.score >= 80 ? 'success' : card.score >= 70 ? 'warning' : 'error'}>
                {card.status}
              </Badge>
              <Link href={card.href} className="text-sm text-accent-600 hover:text-accent-700">
                Voir details →
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Priorites</h2>
          <div className="space-y-3">
            {priorities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Badge variant={item.severity as any}>{item.severity}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                </div>
                <span className="text-xs text-slate-500 uppercase">{item.scope}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Couverture</h2>
          <div className="space-y-4">
            {[
              { name: 'Collecte M365', coverage: 92 },
              { name: 'Collecte AD', coverage: 88 },
              { name: 'Correlation hybride', coverage: 64 },
            ].map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.name}</span>
                  <span className="text-slate-900 font-medium">{item.coverage}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-600"
                    style={{ width: `${item.coverage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
