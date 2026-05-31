'use client';

import { useEffect, useState } from 'react';
import { provider } from '@/services/api';
import { StatusBadge } from '@/components/StatusBadge';

const ALLOWED_STATUSES = [
  { value: 'PROVIDER_ACKNOWLEDGED', label: 'Acknowledge' },
  { value: 'DIAGNOSIS_COMPLETE', label: 'Diagnosis Complete' },
  { value: 'QUOTE_SENT', label: 'Send Quote' },
  { value: 'REPAIR_IN_PROGRESS', label: 'Start Repair' },
  { value: 'REPAIR_COMPLETE', label: 'Repair Complete' },
];

export default function PartnerDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    const result = await provider.getComplaints();
    if (result.success && result.data) {
      setComplaints(Array.isArray(result.data) ? result.data : []);
    }
    setLoading(false);
  }

  async function handleUpdate(id: string) {
    if (!updateStatus) return;
    setUpdating(true);
    const result = await provider.updateStatus(id, updateStatus, updateNotes);
    setUpdating(false);
    if (result.success) {
      setExpandedId(null);
      setUpdateStatus('');
      setUpdateNotes('');
      loadComplaints();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Assigned Complaints</h1>
          <p className="text-gray-500 mt-1">{complaints.length} complaints assigned to you</p>
        </div>
        <button onClick={loadComplaints} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-16 text-center">
          <span className="text-5xl block mb-4">🔧</span>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No complaints assigned</h3>
          <p className="text-gray-400">New assignments will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-emerald-700 font-semibold">{c.complaintNumber}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="font-medium text-gray-800">
                    {c.productCategory || c.category?.name} &mdash; {c.modelNumber || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  className="btn-secondary text-sm"
                >
                  {expandedId === c.id ? 'Close' : 'Update'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-400">Customer</span>
                  <p className="font-medium">{c.user?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Phone</span>
                  <p className="font-medium">{c.user?.phone}</p>
                </div>
                <div>
                  <span className="text-gray-400">City</span>
                  <p className="font-medium">{c.serviceAddress || c.user?.city || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Issue</span>
                  <p className="font-medium">{c.issueType || 'N/A'}</p>
                </div>
              </div>

              {c.issueDescription && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-3">{c.issueDescription}</p>
              )}

              {expandedId === c.id && (
                <div className="border-t border-gray-100 pt-4 mt-3">
                  <h4 className="font-medium text-gray-700 mb-2">Update Status</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ALLOWED_STATUSES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setUpdateStatus(s.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          updateStatus === s.value
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Add notes (optional)"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    className="input-field mb-3"
                    rows={2}
                  />
                  <button
                    onClick={() => handleUpdate(c.id)}
                    disabled={!updateStatus || updating}
                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-sm"
                  >
                    {updating ? 'Updating...' : 'Submit Update'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
