'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: '/overview' },
  { name: 'Dashboards', href: '/dashboards' },
  { name: 'Posture', href: '/posture' },
  { name: 'Findings', href: '/findings' },
  { name: 'Assets', href: '/assets' },
  { name: 'Connectors', href: '/connectors' },
  { name: 'Settings', href: '/settings' },
];

interface Tenant {
  id: string;
  name: string;
}

interface UserInfo {
  user: { name?: string; email: string };
  currentTenant: Tenant | null;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo] = useState<UserInfo | null>(null);

  const handleLogout = () => {
    document.cookie = 'gb_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-48 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="font-semibold text-slate-900">Guardiboard</div>
      </div>
      
      <div className="p-2 border-b border-slate-200">
        <div className="text-xs text-slate-500">Workspace</div>
        <div className="text-sm font-medium text-slate-900 truncate">
          {userInfo?.currentTenant?.name || 'Select'}
        </div>
      </div>
      
      <nav className="flex-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 text-sm rounded ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 truncate">
          {userInfo?.user?.name || userInfo?.user?.email || 'User'}
        </div>
        <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-slate-700">
          Logout
        </button>
      </div>
    </div>
  );
}
