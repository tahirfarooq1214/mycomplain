'use client';

import { useEffect, useState } from 'react';
import { admin } from '@/services/api';

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    const result = await admin.getBrands();
    if (result.success && result.data) {
      setBrands(Array.isArray(result.data) ? result.data : []);
    }
    setLoading(false);
  }

  const tierColors: Record<string, string> = {
    EMAIL: 'bg-indigo-100 text-indigo-700',
    WHATSAPP: 'bg-green-100 text-green-700',
    MANUAL: 'bg-yellow-100 text-yellow-800',
  };

  const tierIcons: Record<string, string> = {
    EMAIL: '📧',
    WHATSAPP: '💬',
    MANUAL: '📞',
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 mt-1">{brands.length} brands registered</p>
        </div>
        <button onClick={loadBrands} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-brand-800 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">Brand</th>
                <th className="table-header">Integration</th>
                <th className="table-header">Helpline</th>
                <th className="table-header">Service Email</th>
                <th className="table-header">Categories</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <p className="font-semibold text-gray-900">{b.name}</p>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${tierColors[b.integrationTier] || 'bg-gray-100 text-gray-600'}`}>
                      {tierIcons[b.integrationTier] || ''} {b.integrationTier}
                    </span>
                  </td>
                  <td className="table-cell text-sm">
                    {b.helplineNumber || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="table-cell text-sm">
                    {b.serviceEmail || <span className="text-gray-300">-</span>}
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {b.categories?.slice(0, 3).map((cat: any) => (
                        <span key={cat.id || cat.categoryId} className="badge bg-gray-100 text-gray-600 text-xs">
                          {cat.category?.name || cat.name}
                        </span>
                      ))}
                      {b.categories?.length > 3 && (
                        <span className="badge bg-gray-100 text-gray-400 text-xs">
                          +{b.categories.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${b.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {b.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
