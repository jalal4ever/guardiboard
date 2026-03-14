import { Sidebar } from '@/components/shell/Sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="ml-48">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
