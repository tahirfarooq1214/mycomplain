'use client';

import { useEffect, useState } from 'react';
import { admin } from '@/services/api';

interface AnalyticsData {
  summary: {
    total: number;
    active: number;
    resolved: number;
    todayCount: number;
    pendingQueue: number;
    avgResolutionHours: number;
  };
  statusDistribution: { status: string; count: number }[];
  serviceTypeBreakdown: { type: string; count: number }[];
  brandBreakdown: { brand: string; count: number }[];
  weeklyTrend: { date: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
  issueTypes: { type: string; count: number }[];
  ratings: { rating: number; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#3B82F6',
  IN_QUEUE: '#F59E0B',
  BEING_PROCESSED: '#6366F1',
  REGISTERED_WITH_BRAND: '#8B5CF6',
  ASSIGNED_TO_PROVIDER: '#6366F1',
  RESOLVED: '#10B981',
  REPAIR_COMPLETE: '#10B981',
  CLOSED: '#6B7280',
  ESCALATED: '#EF4444',
  CANCELLED: '#9CA3AF',
  QUOTE_SENT: '#F59E0B',
  REPAIR_IN_PROGRESS: '#0EA5E9',
};

function formatStatus(s: string) {
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.getAnalytics().then((res) => {
      if (res.success && res.data) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-gray-400 py-12">Failed to load analytics</div>;
  }

  const maxWeekly = Math.max(...data.weeklyTrend.map((d) => d.count), 1);
  const maxBrand = Math.max(...data.brandBreakdown.map((b) => b.count), 1);
  const totalStatus = data.statusDistribution.reduce((s, d) => s + d.count, 0) || 1;
  const maxIssue = Math.max(...data.issueTypes.map((i) => i.count), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Complaint trends and performance metrics</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total', value: data.summary.total, icon: '📋', bg: 'bg-blue-50' },
          { label: 'Active', value: data.summary.active, icon: '🔄', bg: 'bg-orange-50' },
          { label: 'Resolved', value: data.summary.resolved, icon: '✅', bg: 'bg-green-50' },
          { label: 'Today', value: data.summary.todayCount, icon: '📅', bg: 'bg-purple-50' },
          { label: 'Queue', value: data.summary.pendingQueue, icon: '📞', bg: 'bg-yellow-50' },
          { label: 'Avg Resolution', value: `${data.summary.avgResolutionHours || 0}h`, icon: '⏱', bg: 'bg-pink-50' },
        ].map((c) => (
          <div key={c.label} className={`stat-card ${c.bg}`}>
            <span className="text-2xl">{c.icon}</span>
            <p className="text-xl font-bold text-gray-900 mt-2">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Trend Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaints This Week</h3>
          <div className="flex items-end justify-between gap-2" style={{ height: 200 }}>
            {data.weeklyTrend.map((day) => {
              const pct = (day.count / maxWeekly) * 100;
              const dateObj = new Date(day.date);
              const label = dateObj.toLocaleDateString('en', { weekday: 'short' });
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-700 mb-1">{day.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-700 to-brand-500 transition-all duration-500"
                    style={{ height: `${Math.max(pct, 4)}%`, minHeight: 4 }}
                  />
                  <span className="text-xs text-gray-400 mt-2">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
          <div className="flex items-center gap-6">
            {/* CSS Donut */}
            <div className="relative" style={{ width: 160, height: 160 }}>
              <svg viewBox="0 0 36 36" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                {(() => {
                  let offset = 0;
                  return data.statusDistribution.map((s) => {
                    const pct = (s.count / totalStatus) * 100;
                    const color = STATUS_COLORS[s.status] || '#9CA3AF';
                    const el = (
                      <circle
                        key={s.status}
                        cx="18" cy="18" r="15.9155"
                        fill="none" stroke={color} strokeWidth="3.5"
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={`${-offset}`}
                        className="transition-all duration-700"
                      />
                    );
                    offset += pct;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-gray-900">{totalStatus}</span>
                <span className="text-xs text-gray-400">Total</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-1.5 max-h-40 overflow-y-auto">
              {data.statusDistribution.slice(0, 8).map((s) => (
                <div key={s.status} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[s.status] || '#9CA3AF' }} />
                  <span className="text-gray-600 truncate flex-1">{formatStatus(s.status)}</span>
                  <span className="font-semibold text-gray-800">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Brands</h3>
          <div className="space-y-3">
            {data.brandBreakdown.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No brand data yet</p>
            ) : (
              data.brandBreakdown.map((b, i) => {
                const pct = (b.count / maxBrand) * 100;
                const colors = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9', '#F97316', '#EF4444', '#6B7280'];
                return (
                  <div key={b.brand}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{b.brand}</span>
                      <span className="text-gray-500">{b.count}</span>
                    </div>
                    <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Issue Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Issue Types</h3>
          <div className="space-y-3">
            {data.issueTypes.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No issue data yet</p>
            ) : (
              data.issueTypes.map((issue) => {
                const pct = (issue.count / maxIssue) * 100;
                return (
                  <div key={issue.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{formatStatus(issue.type)}</span>
                      <span className="text-gray-500">{issue.count}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Service Type Split */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Type Split</h3>
        <div className="flex gap-6 items-center">
          {data.serviceTypeBreakdown.map((s) => {
            const isBrand = s.type === 'BRAND_WARRANTY';
            const pct = data.summary.total > 0 ? Math.round((s.count / data.summary.total) * 100) : 0;
            return (
              <div key={s.type} className="flex-1 text-center">
                <div className={`rounded-2xl p-6 ${isBrand ? 'bg-indigo-50' : 'bg-emerald-50'}`}>
                  <span className="text-3xl">{isBrand ? '🏢' : '🔧'}</span>
                  <p className="text-3xl font-bold mt-2" style={{ color: isBrand ? '#4F46E5' : '#059669' }}>
                    {s.count}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{isBrand ? 'Brand Warranty' : 'Third-Party'}</p>
                  <p className="text-xs text-gray-400 mt-1">{pct}% of total</p>
                </div>
              </div>
            );
          })}
          {data.serviceTypeBreakdown.length === 0 && (
            <p className="text-gray-400 text-center w-full py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* 30-day Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">30-Day Trend</h3>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-0.5" style={{ height: 120, minWidth: data.dailyTrend.length * 14 }}>
            {data.dailyTrend.map((day) => {
              const maxDaily = Math.max(...data.dailyTrend.map((d) => d.count), 1);
              const pct = (day.count / maxDaily) * 100;
              return (
                <div
                  key={day.date}
                  className="flex-1 bg-brand-200 hover:bg-brand-400 rounded-t transition-all duration-200 cursor-pointer group relative"
                  style={{ height: `${Math.max(pct, 3)}%`, minWidth: 8 }}
                  title={`${day.date}: ${day.count}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>{data.dailyTrend[0]?.date?.slice(5)}</span>
            <span>{data.dailyTrend[data.dailyTrend.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
