'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCmsAuth } from '@/context/AuthContext';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useCmsAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔧</span>
          <div>
            <h1 className="text-lg font-bold">MyComplain Partner Portal</h1>
            <p className="text-emerald-200 text-xs">{user.fullName}</p>
          </div>
        </div>
        <button onClick={logout} className="text-sm text-emerald-200 hover:text-white transition-colors">
          Sign Out
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </div>
  );
}
