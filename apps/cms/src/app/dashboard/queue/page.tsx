'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { admin } from '@/services/api';
import { StatusBadge } from '@/components/StatusBadge';

export default function QueuePage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  async function loadQueue() {
    setLoading(true);
    const result = await admin.getQueue();
    if (result.success && result.data) {
      setQueue(Array.isArray(result.data) ? result.data : []);
    }
    setLoading(false);
  }

  async function handlePickUp(complaintId: string) {
    const result = await admin.updateStatus(complaintId, 'CALL_IN_PROGRESS', 'Picked up by ops agent');
    if (result.success) loadQueue();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call Queue</h1>
          <p className="text-gray-500 mt-1">
            Complaints requiring manual brand calls (FIFO)
          </p>
        </div>
        <button onClick={loadQueue} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-brand-800 border-t-transparent rounded-full" />
        </div>
      ) : queue.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-16 text-center">
          <span className="text-5xl block mb-4">📞</span>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">Queue is empty</h3>
          <p className="text-gray-400">No complaints waiting for brand calls right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((c, index) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-brand-700 font-semibold">{c.complaintNumber}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {c.brand?.name} &mdash; {c.productCategory || c.category?.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Customer: {c.user?.fullName || 'N/A'} ({c.user?.phone})
                    </p>
                    {c.issueDescription && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{c.issueDescription}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Queued {new Date(c.createdAt).toLocaleString()}
                      {c.brand?.helplineNumber && (
                        <span className="ml-3 text-brand-700">
                          Brand helpline: <strong>{c.brand.helplineNumber}</strong>
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4 shrink-0">
                  {c.status === 'QUEUED_FOR_CALL' && (
                    <button
                      onClick={() => handlePickUp(c.id)}
                      className="btn-primary text-sm bg-yellow-600 hover:bg-yellow-700"
                    >
                      Pick Up
                    </button>
                  )}
                  <Link
                    href={`/dashboard/complaints/${c.id}`}
                    className="btn-secondary text-sm"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
