import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  complaint: any;
  onPress: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  SUBMITTED: { bg: '#DBEAFE', text: '#1D4ED8' },
  ROUTING: { bg: '#E0E7FF', text: '#4338CA' },
  QUEUED_FOR_CALL: { bg: '#FEF3C7', text: '#B45309' },
  CALL_IN_PROGRESS: { bg: '#FED7AA', text: '#C2410C' },
  REGISTERED_WITH_BRAND: { bg: '#E0E7FF', text: '#4338CA' },
  PENDING_PROVIDER_ASSIGNMENT: { bg: '#FEF3C7', text: '#B45309' },
  PROVIDER_ASSIGNED: { bg: '#CFFAFE', text: '#0E7490' },
  PROVIDER_ACKNOWLEDGED: { bg: '#E0E7FF', text: '#4338CA' },
  DIAGNOSIS_COMPLETE: { bg: '#DDD6FE', text: '#6D28D9' },
  QUOTE_SENT: { bg: '#FDE68A', text: '#92400E' },
  QUOTE_APPROVED: { bg: '#D1FAE5', text: '#065F46' },
  REPAIR_IN_PROGRESS: { bg: '#FED7AA', text: '#C2410C' },
  REPAIR_COMPLETE: { bg: '#D1FAE5', text: '#065F46' },
  RESOLVED: { bg: '#D1FAE5', text: '#065F46' },
  CLOSED: { bg: '#E5E7EB', text: '#4B5563' },
  ESCALATED: { bg: '#FEE2E2', text: '#B91C1C' },
  CANCELLED: { bg: '#E5E7EB', text: '#6B7280' },
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ComplaintCard({ complaint, onPress }: Props) {
  const colors = STATUS_COLORS[complaint.status] || { bg: '#E5E7EB', text: '#6B7280' };
  const isBrandService = complaint.serviceType === 'BRAND_WARRANTY';
  const accentColor = isBrandService ? Colors.brandService : Colors.thirdParty;

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: accentColor }]} onPress={onPress} activeOpacity={0.7}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, { backgroundColor: isBrandService ? Colors.brandServiceLight : Colors.thirdPartyLight }]}>
          <Text style={[styles.typeBadgeText, { color: accentColor }]}>
            {isBrandService ? '🏢 Brand' : '🔧 Third-Party'}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(complaint.createdAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      {/* Product info */}
      <View style={styles.mainRow}>
        <Text style={styles.category}>
          {complaint.category?.icon || '📦'} {complaint.category?.name || 'Appliance'}
        </Text>
        {complaint.brand && (
          <Text style={styles.brand}>{complaint.brand.name}</Text>
        )}
        {complaint.modelNumber && (
          <Text style={styles.model}>{complaint.modelNumber}</Text>
        )}
      </View>

      {/* Status row */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: colors.text }]} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {formatStatus(complaint.status)}
          </Text>
        </View>
        <Text style={styles.complaintNum}>{complaint.complaintNumber}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  date: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

  mainRow: { marginBottom: 14 },
  category: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 3, letterSpacing: -0.2 },
  brand: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  model: { fontSize: 12, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },

  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  complaintNum: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
