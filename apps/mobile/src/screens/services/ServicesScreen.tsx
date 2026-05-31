import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../../constants/colors';
import { directory } from '../../services/api';
import { CardSkeleton } from '../../components/UIKit';

export function ServicesScreen() {
  const [brands, setBrands] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const result = await directory.getAll();
    if (result.success && result.data) setBrands(result.data as any[]);
    setLoading(false);
  }

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search brand..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>Brand Directory</Text>
      <Text style={styles.sectionSubtitle}>Contact information for all supported brands</Text>

      {loading ? (
        <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
      ) : (
        filtered.map((brand) => (
          <View key={brand.id} style={styles.brandCard}>
            <View style={styles.brandHeader}>
              <Text style={styles.brandName}>{brand.name}</Text>
              {brand.avgRating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>⭐ {brand.avgRating.toFixed(1)}</Text>
                </View>
              )}
            </View>

            {brand.helplineNumber && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${brand.helplineNumber}`)} activeOpacity={0.6}>
                <View style={[styles.contactIconBg, { backgroundColor: Colors.successLight }]}>
                  <Text style={styles.contactIcon}>📞</Text>
                </View>
                <Text style={styles.contactText}>{brand.helplineNumber}</Text>
                <View style={styles.callBtn}><Text style={styles.callBtnText}>Call</Text></View>
              </TouchableOpacity>
            )}

            {brand.serviceEmail && (
              <View style={styles.contactRow}>
                <View style={[styles.contactIconBg, { backgroundColor: Colors.infoLight }]}>
                  <Text style={styles.contactIcon}>📧</Text>
                </View>
                <Text style={styles.contactText}>{brand.serviceEmail}</Text>
              </View>
            )}

            {brand.website && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(brand.website)} activeOpacity={0.6}>
                <View style={[styles.contactIconBg, { backgroundColor: '#EDE9FE' }]}>
                  <Text style={styles.contactIcon}>🌐</Text>
                </View>
                <Text style={[styles.contactText, { color: Colors.primaryLight }]}>{brand.website.replace('https://', '')}</Text>
              </TouchableOpacity>
            )}

            {brand.avgResponseHours && (
              <View style={styles.responseBadge}>
                <Text style={styles.responseText}>⏱ Avg response: {brand.avgResponseHours} hours</Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, paddingHorizontal: 16, marginBottom: 24, borderWidth: 1.5, borderColor: Colors.border },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 15, fontSize: 16, color: Colors.textPrimary },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4, letterSpacing: -0.3 },
  sectionSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  brandCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  brandHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  brandName: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  ratingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 13, color: '#B45309', fontWeight: '700' },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  contactIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  contactIcon: { fontSize: 16 },
  contactText: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  callBtn: { backgroundColor: Colors.success, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10 },
  callBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  responseBadge: { backgroundColor: Colors.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginTop: 10 },
  responseText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
});
