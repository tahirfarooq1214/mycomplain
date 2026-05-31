'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCmsAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isLoading } = useCmsAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
    } else if (user.type === 'provider') {
      router.replace('/partner');
    } else {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-brand-800 border-t-transparent rounded-full" />
    </div>
  );
}
