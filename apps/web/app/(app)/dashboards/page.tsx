import { Card } from '@/components/ui/Card';

const templates = [
  {
    name: 'Vue Executive',
    description: 'KPIs globaux, tendances et priorites',
    widgets: 8,
  },
  {
    name: 'SOC Analyst',
    description: 'Findings critiques, anomalies, details techniques',
    widgets: 12,
  },
  {
    name: 'AD Hardening',
    description: 'Focus Active Directory et delegation',
    widgets: 9,
  },
  {
    name: 'M365 Governance',
    description: 'Applications, permissions, Conditional Access',
    widgets: 10,
  },
];

const dashboards = [
  { name: 'Posture globale', updatedAt: '2024-01-15', owner: 'Equipe SecOps', widgets: 10 },
  { name: 'AD Operations', updatedAt: '2024-01-14', owner: 'Equipe Infra', widgets: 8 },
  { name: 'M365 Risk', updatedAt: '2024-01-12', owner: 'Equipe IAM', widgets: 9 },
];

export default function DashboardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboards</h1>
          <p className="mt-1 text-sm text-slate-500">
            Personnalisez vos vues et widgets
          </p>
        </div>
        <button className="btn-primary">Nouveau dashboard</button>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Vos dashboards</h2>
        <div className="space-y-3">
          {dashboards.map((dashboard) => (
            <div key={dashboard.name} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-900">{dashboard.name}</p>
                <p className="text-xs text-slate-500">
                  {dashboard.widgets} widgets · {dashboard.owner} · Mis a jour le {dashboard.updatedAt}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm">Ouvrir</button>
                <button className="btn-secondary text-sm">Editer</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Templates</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.name}>
              <h3 className="text-lg font-semibold text-slate-900">{template.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{template.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">{template.widgets} widgets</span>
                <button className="btn-secondary text-sm">Utiliser</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
