'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { admin } from '@/services/api';
import { StatusBadge, ServiceTypeBadge } from '@/components/StatusBadge';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Status update form
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Provider assignment
  const [selectedProvider, setSelectedProvider] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Call outcome
  const [callRef, setCallRef] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [callSuccess, setCallSuccess] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    const [compRes, provRes] = await Promise.all([
      admin.getComplaint(id as string),
      admin.getProviders(),
    ]);

    if (compRes.success && compRes.data) setComplaint(compRes.data);
    if (provRes.success && provRes.data) {
      setProviders(Array.isArray(provRes.data) ? provRes.data : []);
    }
    setLoading(false);
  }

  async function handleStatusUpdate() {
    if (!newStatus) return;
    setUpdating(true);
    const result = await admin.updateStatus(id as string, newStatus, statusNotes);
    setUpdating(false);
    if (result.success) {
      setNewStatus('');
      setStatusNotes('');
      loadData();
    }
  }

  async function handleAssignProvider() {
    if (!selectedProvider) return;
    setUpdating(true);
    const result = await admin.assignProvider(id as string, selectedProvider, assignNotes);
    setUpdating(false);
    if (result.success) {
      setSelectedProvider('');
      setAssignNotes('');
      loadData();
    }
  }

  async function handleCallOutcome() {
    setUpdating(true);
    const result = await admin.recordCallOutcome(id as string, {
      outcome: callSuccess ? 'registered' : 'declined',
      brandReferenceNumber: callRef,
      notes: callNotes,
    });
    setUpdating(false);
    if (result.success) {
      setCallRef('');
      setCallNotes('');
      loadData();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-brand-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!complaint) {
    return <div className="text-center py-16 text-gray-400">Complaint not found</div>;
  }

  const c = complaint;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-xl">
          &larr;
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{c.complaintNumber}</h1>
            <StatusBadge status={c.status} />
            <ServiceTypeBadge type={c.serviceType} />
          </div>
          <p className="text-gray-500 mt-1">
            Created {new Date(c.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="font-medium">{c.user?.fullName || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Phone</span>
                <p className="font-medium">{c.user?.phone}</p>
              </div>
              <div>
                <span className="text-gray-500">Email</span>
                <p className="font-medium">{c.user?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">City</span>
                <p className="font-medium">{c.user?.city || 'N/A'}{c.user?.area ? `, ${c.user.area}` : ''}</p>
              </div>
            </div>
          </div>

          {/* Product & Issue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Product & Issue Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500">Brand</span>
                <p className="font-medium">{c.brand?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Category</span>
                <p className="font-medium">{c.category?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Model</span>
                <p className="font-medium">{c.modelNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Serial</span>
                <p className="font-medium">{c.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Issue Type</span>
                <p className="font-medium">{c.issueType || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Preferred Time</span>
                <p className="font-medium">{c.preferredTime || 'N/A'}</p>
              </div>
              {c.purchaseDate && (
                <div>
                  <span className="text-gray-500">Purchase Date</span>
                  <p className="font-medium">{new Date(c.purchaseDate).toLocaleDateString()}</p>
                </div>
              )}
              {c.brandReferenceNumber && (
                <div>
                  <span className="text-gray-500">Brand Ref #</span>
                  <p className="font-medium font-mono text-brand-700">{c.brandReferenceNumber}</p>
                </div>
              )}
            </div>
            {c.description && (
              <div>
                <span className="text-sm text-gray-500">Description</span>
                <p className="text-sm mt-1 bg-gray-50 rounded-lg p-3">{c.description}</p>
              </div>
            )}
          </div>

          {/* Attached Media */}
          {c.media && c.media.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Attached Photos ({c.media.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {c.media.map((m: any) => (
                  <a
                    key={m.id}
                    href={`${m.url.startsWith('http') ? m.url : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '') + m.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-brand-400 hover:shadow-lg transition-all"
                  >
                    <img
                      src={`${m.url.startsWith('http') ? m.url : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '') + m.url}`}
                      alt="Complaint media"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Timeline</h2>
            {c.timeline && c.timeline.length > 0 ? (
              <div className="space-y-4">
                {c.timeline.map((entry: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-brand-600 rounded-full mt-1.5" />
                      {i < c.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-800">{entry.status}</p>
                      {entry.note && <p className="text-sm text-gray-500 mt-0.5">{entry.note}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(entry.createdAt).toLocaleString()}
                        {entry.updatedBy && ` by ${entry.updatedBy}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No timeline entries yet</p>
            )}
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Update Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-field mb-2"
            >
              <option value="">Select new status...</option>
              <option value="IN_QUEUE">In Queue</option>
              <option value="BEING_PROCESSED">Being Processed</option>
              <option value="RECEIVED_BY_BRAND">Received by Brand</option>
              <option value="REGISTERED_WITH_BRAND">Registered with Brand</option>
              <option value="TECHNICIAN_ASSIGNED">Technician Assigned</option>
              <option value="VISIT_SCHEDULED">Visit Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ASSIGNED_TO_PROVIDER">Assigned to Provider</option>
              <option value="DIAGNOSIS_COMPLETE">Diagnosis Complete</option>
              <option value="QUOTE_SENT">Quote Sent</option>
              <option value="REPAIR_IN_PROGRESS">Repair in Progress</option>
              <option value="REPAIR_COMPLETE">Repair Complete</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="ESCALATED">Escalated</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <textarea
              placeholder="Notes (optional)"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              className="input-field mb-3"
              rows={2}
            />
            <button
              onClick={handleStatusUpdate}
              disabled={!newStatus || updating}
              className="btn-primary w-full text-sm"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* Assign Provider (for third-party) */}
          {c.serviceType === 'THIRD_PARTY' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Assign Provider</h3>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="input-field mb-2"
              >
                <option value="">Select provider...</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.companyName || p.name} ({p.city || 'Any'})
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Assignment notes (optional)"
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                className="input-field mb-3"
                rows={2}
              />
              <button
                onClick={handleAssignProvider}
                disabled={!selectedProvider || updating}
                className="btn-primary w-full text-sm bg-emerald-600 hover:bg-emerald-700"
              >
                {updating ? 'Assigning...' : 'Assign Provider'}
              </button>
            </div>
          )}

          {/* Record Call Outcome (for brand warranty manual) */}
          {c.serviceType === 'BRAND_WARRANTY' && ['QUEUED_FOR_CALL', 'CALL_IN_PROGRESS'].includes(c.status) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Record Call Outcome</h3>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setCallSuccess(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    callSuccess ? 'bg-green-100 text-green-800 ring-2 ring-green-500' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Successful
                </button>
                <button
                  onClick={() => setCallSuccess(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !callSuccess ? 'bg-red-100 text-red-800 ring-2 ring-red-500' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Failed
                </button>
              </div>
              {callSuccess && (
                <input
                  type="text"
                  placeholder="Brand reference number"
                  value={callRef}
                  onChange={(e) => setCallRef(e.target.value)}
                  className="input-field mb-2"
                />
              )}
              <textarea
                placeholder="Call notes"
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="input-field mb-3"
                rows={2}
              />
              <button
                onClick={handleCallOutcome}
                disabled={updating}
                className="btn-primary w-full text-sm bg-yellow-600 hover:bg-yellow-700"
              >
                {updating ? 'Saving...' : 'Record Outcome'}
              </button>
            </div>
          )}

          {/* Service Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Service Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service Type</span>
                <ServiceTypeBadge type={c.serviceType} />
              </div>
              {c.brand?.integrationTier && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Integration</span>
                  <span className="font-medium">{c.brand.integrationTier}</span>
                </div>
              )}
              {c.assignments?.[0] && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Provider</span>
                    <span className="font-medium">{c.assignments[0].provider?.companyName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned</span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.assignments[0].assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
              {c.quotedAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Quote</span>
                  <span className="font-medium">Rs. {c.quotedAmount.toLocaleString()}</span>
                </div>
              )}
              {c.userRating && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium">{'⭐'.repeat(c.userRating)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
