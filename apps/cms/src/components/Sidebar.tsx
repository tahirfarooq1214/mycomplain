'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCmsAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/complaints', label: 'Complaints', icon: '📋' },
  { href: '/dashboard/queue', label: 'Call Queue', icon: '📞' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { href: '/dashboard/providers', label: 'Providers', icon: '🔧' },
  { href: '/dashboard/brands', label: 'Brands', icon: '🏢' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useCmsAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <h1 className="text-lg font-bold">MyComplain</h1>
            <p className="text-xs text-gray-400">CMS Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
            {(user?.fullName || 'A')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName || 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-sm text-gray-400 hover:text-red-400 transition-colors px-1"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
