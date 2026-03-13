import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-600 rounded-lg"></div>
            <span className="text-xl font-bold text-slate-900">Guardiboard</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/features" className="text-slate-600 hover:text-slate-900">
              Fonctionnalités
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900">
              Tarifs
            </Link>
            <Link href="/login" className="btn-primary">
              Connexion
            </Link>
          </nav>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Supervision de la posture de sécurité
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Plateforme SaaS hybride pour superviser votre Active Directory et Microsoft 365. 
            Supervisez ce que vous voulez, comme vous le voulez.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-lg px-6 py-3">
              Commencer gratuitement
            </Link>
            <Link href="/demo" className="btn-secondary text-lg px-6 py-3">
              Demo
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Trois modes de supervision
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Hybride</h3>
              <p className="text-slate-600">
                Supervision complète avec corrélation entre Active Directory et Microsoft 365.
              </p>
            </div>
            <div className="card">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">🖥️</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AD On-Premise</h3>
              <p className="text-slate-600">
                Analyse de la posture Active Directory : comptes, groupes, délégation, GPO.
              </p>
            </div>
            <div className="card">
              <div className="w-12 h-12 bg-teal-100 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-2xl">☁️</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Microsoft 365</h3>
              <p className="text-slate-600">
                Supervision M365 via Microsoft Graph : utilisateurs, apps, Conditional Access.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
