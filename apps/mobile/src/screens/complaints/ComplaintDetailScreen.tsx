import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { complaints as complaintsApi, getMediaUrl } from '../../services/api';
import { StatusTimeline } from '../../components/StatusTimeline';

export function ComplaintDetailScreen() {
  const route = useRoute<any>();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaint();
  }, []);

  async function loadComplaint() {
    setLoading(true);
    const result = await complaintsApi.getById(route.params.id);
    if (result.success) setComplaint(result.data);
    setLoading(false);
  }

  async function handleEscalate() {
    Alert.alert('Escalate', 'Are you sure you want to escalate this complaint?', [
      { text: 'Cancel' },
      {
        text: 'Escalate',
        style: 'destructive',
        onPress: async () => {
          await complaintsApi.escalate(complaint.id);
          loadComplaint();
        },
      },
    ]);
  }

  async function handleApproveQuote(approved: boolean) {
    await complaintsApi.approveQuote(complaint.id, approved);
    loadComplaint();
  }

  if (loading || !complaint) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }

  const isBrand = complaint.serviceType === 'BRAND_WARRANTY';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <View style={[styles.typeBadge, { backgroundColor: isBrand ? Colors.brandService : Colors.thirdParty }]}>
          <Text style={styles.typeBadgeText}>{isBrand ? '🏢 Brand Warranty Service' : '🔧 Third-Party Repair'}</Text>
        </View>

        <Text style={styles.complaintNum}>{complaint.complaintNumber}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Product</Text>
          <Text style={styles.detailValue}>{complaint.category?.icon} {complaint.category?.name}</Text>
        </View>

        {complaint.brand && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand</Text>
            <Text style={styles.detailValue}>{complaint.brand.name}</Text>
          </View>
        )}

        {complaint.modelNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Model</Text>
            <Text style={styles.detailValue}>{complaint.modelNumber}</Text>
          </View>
        )}

        {complaint.brandReferenceNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand Ref #</Text>
            <Text style={[styles.detailValue, { color: Colors.primary, fontWeight: 'bold' }]}>
              {complaint.brandReferenceNumber}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.issueLabel}>Issue: {complaint.issueType?.replace(/_/g, ' ')}</Text>
        <Text style={styles.issueDesc}>{complaint.description}</Text>
      </View>

      {/* Quote card (for third-party with pending quote) */}
      {complaint.status === 'QUOTE_SENT' && complaint.quotedAmount && (
        <View style={styles.quoteCard}>
          <Text style={styles.quoteTitle}>Repair Quote</Text>
          <Text style={styles.quoteAmount}>Rs. {complaint.quotedAmount.toLocaleString()}</Text>
          {complaint.diagnosisNotes && (
            <Text style={styles.quoteDiagnosis}>{complaint.diagnosisNotes}</Text>
          )}
          <View style={styles.quoteActions}>
            <TouchableOpacity
              style={[styles.quoteBtn, { backgroundColor: Colors.error }]}
              onPress={() => handleApproveQuote(false)}
            >
              <Text style={styles.quoteBtnText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quoteBtn, { backgroundColor: Colors.success }]}
              onPress={() => handleApproveQuote(true)}
            >
              <Text style={styles.quoteBtnText}>Approve Repair</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Attached Photos */}
      {complaint.media && complaint.media.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attached Photos</Text>
          <View style={styles.mediaGrid}>
            {complaint.media.map((m: any) => (
              <View key={m.id} style={styles.mediaThumb}>
                <Image
                  source={{ uri: getMediaUrl(m.url) }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <StatusTimeline entries={complaint.timeline || []} />
      </View>

      {/* Actions */}
      {!['RESOLVED', 'CLOSED', 'CANCELLED', 'REPAIR_COMPLETE'].includes(complaint.status) && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.escalateBtn} onPress={handleEscalate}>
            <Text style={styles.escalateBtnText}>⚠️ Escalate Complaint</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Rating (if resolved) */}
      {['RESOLVED', 'REPAIR_COMPLETE'].includes(complaint.status) && !complaint.userRating && (
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>How was the service?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => complaintsApi.rate(complaint.id, star).then(loadComplaint)}>
                <Text style={styles.star}>☆</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginBottom: 16 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  typeBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  complaintNum: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 14, color: Colors.textMuted },
  detailValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: 12 },
  issueLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4, textTransform: 'capitalize' },
  issueDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  // Quote
  quoteCard: { backgroundColor: '#FFF7ED', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FDBA74' },
  quoteTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 8 },
  quoteAmount: { fontSize: 28, fontWeight: 'bold', color: Colors.warning, marginBottom: 8 },
  quoteDiagnosis: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  quoteActions: { flexDirection: 'row', gap: 12 },
  quoteBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  quoteBtnText: { color: Colors.white, fontWeight: 'bold', fontSize: 14 },
  // Sections
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 12 },
  // Actions
  actions: { marginBottom: 16 },
  escalateBtn: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  escalateBtnText: { color: Colors.error, fontWeight: '600' },
  // Rating
  ratingCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, alignItems: 'center' },
  ratingTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  stars: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 36, color: Colors.accent },
  // Media
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, backgroundColor: Colors.white, borderRadius: 16, padding: 16 },
  mediaThumb: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden' },
  mediaImage: { width: '100%', height: '100%' },
});
