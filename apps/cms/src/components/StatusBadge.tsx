'use client';

const statusStyles: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  IN_QUEUE: 'bg-yellow-100 text-yellow-800',
  BEING_PROCESSED: 'bg-orange-100 text-orange-700',
  RECEIVED_BY_BRAND: 'bg-teal-100 text-teal-700',
  TECHNICIAN_ASSIGNED: 'bg-cyan-100 text-cyan-700',
  VISIT_SCHEDULED: 'bg-sky-100 text-sky-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  ASSIGNED_TO_PROVIDER: 'bg-indigo-100 text-indigo-700',
  ROUTING: 'bg-purple-100 text-purple-700',
  ROUTED_EMAIL: 'bg-indigo-100 text-indigo-700',
  ROUTED_WHATSAPP: 'bg-green-100 text-green-700',
  QUEUED_FOR_CALL: 'bg-yellow-100 text-yellow-800',
  CALL_IN_PROGRESS: 'bg-orange-100 text-orange-700',
  REGISTERED_WITH_BRAND: 'bg-teal-100 text-teal-700',
  PENDING_PROVIDER_ASSIGNMENT: 'bg-amber-100 text-amber-700',
  PROVIDER_ASSIGNED: 'bg-cyan-100 text-cyan-700',
  PROVIDER_ACKNOWLEDGED: 'bg-sky-100 text-sky-700',
  DIAGNOSIS_COMPLETE: 'bg-violet-100 text-violet-700',
  QUOTE_SENT: 'bg-fuchsia-100 text-fuchsia-700',
  QUOTE_APPROVED: 'bg-lime-100 text-lime-700',
  REPAIR_IN_PROGRESS: 'bg-orange-100 text-orange-700',
  REPAIR_COMPLETE: 'bg-emerald-100 text-emerald-700',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
  ESCALATED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  IN_QUEUE: 'In Queue',
  BEING_PROCESSED: 'Being Processed',
  RECEIVED_BY_BRAND: 'Received by Brand',
  TECHNICIAN_ASSIGNED: 'Technician Assigned',
  VISIT_SCHEDULED: 'Visit Scheduled',
  IN_PROGRESS: 'In Progress',
  ASSIGNED_TO_PROVIDER: 'Assigned to Provider',
  ROUTING: 'Routing',
  ROUTED_EMAIL: 'Routed (Email)',
  ROUTED_WHATSAPP: 'Routed (WhatsApp)',
  QUEUED_FOR_CALL: 'Queued for Call',
  CALL_IN_PROGRESS: 'Call in Progress',
  REGISTERED_WITH_BRAND: 'Registered with Brand',
  PENDING_PROVIDER_ASSIGNMENT: 'Pending Assignment',
  PROVIDER_ASSIGNED: 'Provider Assigned',
  PROVIDER_ACKNOWLEDGED: 'Provider Acknowledged',
  DIAGNOSIS_COMPLETE: 'Diagnosis Complete',
  QUOTE_SENT: 'Quote Sent',
  QUOTE_APPROVED: 'Quote Approved',
  REPAIR_IN_PROGRESS: 'Repair in Progress',
  REPAIR_COMPLETE: 'Repair Complete',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  ESCALATED: 'Escalated',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusStyles[status] || 'bg-gray-100 text-gray-600'}`}>
      {statusLabels[status] || status}
    </span>
  );
}

export function ServiceTypeBadge({ type }: { type: string }) {
  if (type === 'BRAND_WARRANTY') {
    return <span className="badge bg-indigo-100 text-indigo-700">Brand Warranty</span>;
  }
  return <span className="badge bg-emerald-100 text-emerald-700">Third-Party</span>;
}
