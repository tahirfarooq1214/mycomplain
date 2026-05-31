import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface TimelineEntry {
  id: string;
  status: string;
  note?: string;
  updatedBy: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#3B82F6',
  ROUTING: '#6366F1',
  ROUTED_EMAIL: '#6366F1',
  ROUTED_WHATSAPP: '#10B981',
  QUEUED_FOR_CALL: '#F59E0B',
  CALL_IN_PROGRESS: '#F97316',
  REGISTERED_WITH_BRAND: '#8B5CF6',
  PENDING_PROVIDER_ASSIGNMENT: '#F59E0B',
  PROVIDER_ASSIGNED: '#6366F1',
  PROVIDER_ACKNOWLEDGED: '#6366F1',
  DIAGNOSIS_COMPLETE: '#0EA5E9',
  QUOTE_SENT: '#F59E0B',
  QUOTE_APPROVED: '#10B981',
  REPAIR_IN_PROGRESS: '#0EA5E9',
  REPAIR_COMPLETE: '#10B981',
  RESOLVED: '#10B981',
  CLOSED: '#6B7280',
  ESCALATED: '#EF4444',
  CANCELLED: '#6B7280',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No timeline entries yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {entries.map((entry, index) => {
        const color = STATUS_COLORS[entry.status] || Colors.textMuted;
        const isLast = index === entries.length - 1;
        const isFirst = index === 0;
        const date = new Date(entry.createdAt);

        return (
          <View key={entry.id} style={styles.entry}>
            {/* Timeline line + dot */}
            <View style={styles.lineCol}>
              <View style={[
                styles.dot,
                { backgroundColor: color },
                isFirst && styles.dotFirst,
              ]}>
                {isFirst && <View style={styles.dotPulse} />}
              </View>
              {!isLast && <View style={[styles.line, { backgroundColor: `${color}30` }]} />}
            </View>

            {/* Content */}
            <View style={[styles.contentCol, !isLast && { paddingBottom: 22 }]}>
              <Text style={[styles.status, { color }]}>{formatStatus(entry.status)}</Text>
              {entry.note && (
                <View style={styles.noteBox}>
                  <Text style={styles.note}>{entry.note}</Text>
                </View>
              )}
              <Text style={styles.time}>
                {date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                {'  '}
                {date.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: Colors.textMuted },
  entry: { flexDirection: 'row' },
  lineCol: { alignItems: 'center', width: 28, marginRight: 14 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 1,
  },
  dotFirst: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -2,
  },
  dotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    margin: 5,
  },
  line: { width: 2, flex: 1, marginTop: 3 },
  contentCol: { flex: 1 },
  status: { fontSize: 14, fontWeight: '700', marginBottom: 3, letterSpacing: -0.1 },
  noteBox: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  note: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  time: { fontSize: 11, color: Colors.textMuted, fontWeight: '500', marginTop: 2 },
});
