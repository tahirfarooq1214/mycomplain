'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { admin } from '@/services/api';

interface DashboardStats {
  totalComplaints: number;
  activeComplaints: number;
  resolvedComplaints: number;
  pendingQueue: number;
  todayComplaints: number;
  brandWarranty: number;
  thirdParty: number;
  avgResolutionHours: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    const [dashRes, complaintsRes] = await Promise.all([
      admin.getDashboard(),
      admin.getComplaints({ limit: '5', sort: 'newest' }),
    ]);

    if (dashRes.success && dashRes.data) setStats(dashRes.data);
    if (complaintsRes.success && complaintsRes.data) {
      setRecentComplaints(
        Array.isArray(complaintsRes.data) ? complaintsRes.data : complaintsRes.data.complaints || []
      );
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Complaints', value: stats?.totalComplaints ?? 0, icon: '📋', color: 'bg-blue-50 text-blue-700', link: '/dashboard/complaints' },
    { label: 'Active', value: stats?.activeComplaints ?? 0, icon: '🔄', color: 'bg-orange-50 text-orange-700', link: '/dashboard/complaints?filter=active' },
    { label: 'Resolved', value: stats?.resolvedComplaints ?? 0, icon: '✅', color: 'bg-green-50 text-green-700', link: '/dashboard/complaints?filter=resolved' },
    { label: 'Call Queue', value: stats?.pendingQueue ?? 0, icon: '📞', color: 'bg-yellow-50 text-yellow-800', link: '/dashboard/queue' },
    { label: 'Today', value: stats?.todayComplaints ?? 0, icon: '📅', color: 'bg-purple-50 text-purple-700' },
    { label: 'Brand Warranty', value: stats?.brandWarranty ?? 0, icon: '🏢', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Third-Party', value: stats?.thirdParty ?? 0, icon: '🔧', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Avg Resolution', value: stats?.avgResolutionHours ? `${stats.avgResolutionHours}h` : 'N/A', icon: '⏱', color: 'bg-pink-50 text-pink-700' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your complaint operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.link || '#'}
            className="stat-card group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`badge ${card.color} text-lg px-3 py-1`}>{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/queue" className="stat-card border-l-4 border-l-yellow-500 hover:border-l-yellow-600">
          <h3 className="font-semibold text-gray-800 mb-1">Process Call Queue</h3>
          <p className="text-sm text-gray-500">
            {stats?.pendingQueue || 0} complaints waiting for brand calls
          </p>
        </Link>
        <Link href="/dashboard/complaints?filter=escalated" className="stat-card border-l-4 border-l-red-500 hover:border-l-red-600">
          <h3 className="font-semibold text-gray-800 mb-1">Escalated Issues</h3>
          <p className="text-sm text-gray-500">Review escalated complaints</p>
        </Link>
        <Link href="/dashboard/providers" className="stat-card border-l-4 border-l-emerald-500 hover:border-l-emerald-600">
          <h3 className="font-semibold text-gray-800 mb-1">Manage Providers</h3>
          <p className="text-sm text-gray-500">View and verify service partners</p>
        </Link>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Complaints</h2>
          <Link href="/dashboard/complaints" className="text-sm text-brand-700 hover:text-brand-800 font-medium">
            View All
          </Link>
        </div>
        {recentComplaints.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <span className="text-4xl block mb-3">📋</span>
            No complaints yet
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentComplaints.map((c: any) => (
              <Link
                key={c.id}
                href={`/dashboard/complaints/${c.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="font-mono text-sm text-gray-500">{c.complaintNumber}</span>
                  <p className="text-sm font-medium text-gray-800">
                    {c.brand?.name} &mdash; {c.productCategory || c.category?.name}
                  </p>
                </div>
                <span className={`badge ${c.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
