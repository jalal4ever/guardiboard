import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Parametres de l'organisation et de l'application
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Organisation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nom</label>
              <input className="input mt-1" defaultValue="Contoso" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Domaine principal</label>
              <input className="input mt-1" defaultValue="contoso.com" />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary">Sauvegarder</button>
              <button className="btn-secondary">Annuler</button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Securite</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">MFA obligatoire</p>
                <p className="text-xs text-slate-500">Applique a tous les utilisateurs</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Sessions courtes</p>
                <p className="text-xs text-slate-500">Expiration apres 8 heures</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Audit des exports</p>
                <p className="text-xs text-slate-500">Journalisation complete</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Notifications</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Findings critiques</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Echecs de collecte</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-700">Rapports hebdo</span>
            <input type="checkbox" className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </div>
  );
}
