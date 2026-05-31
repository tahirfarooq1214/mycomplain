'use client';

import { useEffect, useState } from 'react';
import { admin } from '@/services/api';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    setLoading(true);
    const result = await admin.getProviders();
    if (result.success && result.data) {
      setProviders(Array.isArray(result.data) ? result.data : []);
    }
    setLoading(false);
  }

  async function handleUpdateStatus(id: string) {
    if (!editStatus) return;
    await admin.updateProvider(id, { verificationStatus: editStatus });
    setEditingId(null);
    setEditStatus('');
    loadProviders();
  }

  const statusColors: Record<string, string> = {
    VERIFIED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    REJECTED: 'bg-gray-100 text-gray-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-500 mt-1">Manage third-party repair partners</p>
        </div>
        <button onClick={loadProviders} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-brand-800 border-t-transparent rounded-full" />
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-16 text-center">
          <span className="text-5xl block mb-4">🔧</span>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No providers yet</h3>
          <p className="text-gray-400">Service providers will appear here once added</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{p.companyName || p.name}</h3>
                  <p className="text-sm text-gray-500">{p.contactPerson || ''}</p>
                </div>
                <span className={`badge ${statusColors[p.verificationStatus] || 'bg-gray-100 text-gray-600'}`}>
                  {p.verificationStatus || 'PENDING'}
                </span>
              </div>

              <div className="space-y-1 text-sm mb-4">
                {p.phone && (
                  <p className="text-gray-600">
                    <span className="text-gray-400 mr-2">Phone:</span>{p.phone}
                  </p>
                )}
                {p.email && (
                  <p className="text-gray-600">
                    <span className="text-gray-400 mr-2">Email:</span>{p.email}
                  </p>
                )}
                {p.city && (
                  <p className="text-gray-600">
                    <span className="text-gray-400 mr-2">City:</span>{p.city}
                    {p.coverageAreas && ` (${p.coverageAreas})`}
                  </p>
                )}
                {p.serviceCategories && (
                  <p className="text-gray-600">
                    <span className="text-gray-400 mr-2">Services:</span>{p.serviceCategories}
                  </p>
                )}
              </div>

              {editingId === p.id ? (
                <div className="flex gap-2">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">Select status...</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <button onClick={() => handleUpdateStatus(p.id)} className="btn-primary text-sm">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-secondary text-sm">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingId(p.id); setEditStatus(p.verificationStatus || ''); }}
                  className="btn-secondary text-sm w-full"
                >
                  Change Status
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
