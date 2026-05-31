'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { NotificationBell } from '@/components/NotificationBell';
import { useCmsAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useCmsAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-end gap-4">
          <NotificationBell />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-bold">
              {(user?.fullName || 'A')[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-600 font-medium">{user?.fullName || 'Admin'}</span>
          </div>
        </div>
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
