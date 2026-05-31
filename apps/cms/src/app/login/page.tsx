'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/services/api';
import { useCmsAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useCmsAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await auth.login(email, password);
    setLoading(false);

    if (result.success && result.data) {
      const { token, type } = result.data;
      const userData = type === 'ops' ? result.data.user : result.data.provider;
      login(token, userData, type as 'ops' | 'provider');

      if (type === 'provider') {
        router.push('/partner');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-800 to-brand-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📱</div>
          <h1 className="text-3xl font-bold text-white">MyComplain</h1>
          <p className="text-brand-200 mt-1">Operations Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Sign in to CMS</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@mycomplain.pk"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            Powered by Qistwalay.com
          </p>
        </form>
      </div>
    </div>
  );
}
