'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { admin } from '@/services/api';
import { StatusBadge, ServiceTypeBadge } from '@/components/StatusBadge';

export default function ComplaintsPage() {
  const searchParams = useSearchParams();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') || 'all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, serviceFilter]);

  async function loadComplaints() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (serviceFilter !== 'all') params.serviceType = serviceFilter;

    const result = await admin.getComplaints(params);
    if (result.success && result.data) {
      setComplaints(
        Array.isArray(result.data) ? result.data : result.data.complaints || []
      );
    }
    setLoading(false);
  }

  const filtered = complaints.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.complaintNumber?.toLowerCase().includes(q) ||
      c.brand?.name?.toLowerCase().includes(q) ||
      c.user?.fullName?.toLowerCase().includes(q) ||
      c.user?.phone?.includes(q) ||
      c.modelNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-500 mt-1">{filtered.length} complaints found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search by ID, brand, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field max-w-[180px]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
            <option value="QUEUED_FOR_CALL">Queued for Call</option>
            <option value="PENDING_PROVIDER_ASSIGNMENT">Pending Assignment</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="input-field max-w-[180px]"
          >
            <option value="all">All Types</option>
            <option value="BRAND_WARRANTY">Brand Warranty</option>
            <option value="THIRD_PARTY">Third-Party</option>
          </select>
          <button onClick={loadComplaints} className="btn-secondary text-sm">
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-6 w-6 border-3 border-brand-800 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <span className="text-4xl block mb-3">📋</span>
            No complaints match your filters
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Complaint #</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Brand / Product</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-mono text-xs text-brand-700 font-semibold">
                      {c.complaintNumber}
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">{c.user?.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{c.user?.phone}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-medium">{c.brand?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{c.modelNumber || c.productCategory}</p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <ServiceTypeBadge type={c.serviceType} />
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="table-cell text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/dashboard/complaints/${c.id}`}
                        className="text-brand-700 hover:text-brand-800 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
