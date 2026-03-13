import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guardiboard - Supervision de la posture de sécurité',
  description: 'Plateforme SaaS de supervision de la posture de sécurité AD On-Premise + Microsoft 365',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
