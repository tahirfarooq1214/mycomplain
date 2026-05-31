import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { complaints as complaintsApi } from '../../services/api';
import { ComplaintCard } from '../../components/ComplaintCard';
import { EmptyState } from '../../components/UIKit';

type Filter = 'all' | 'active' | 'resolved';

export function MyComplaintsScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    setLoading(true);
    const result = await complaintsApi.getAll();
    if (result.success && result.data) setData(result.data as any[]);
    setLoading(false);
  }

  const filtered = data.filter((c) => {
    // Status filter
    if (filter === 'active' && ['CLOSED', 'CANCELLED', 'RESOLVED', 'REPAIR_COMPLETE'].includes(c.status)) return false;
    if (filter === 'resolved' && !['RESOLVED', 'REPAIR_COMPLETE', 'CLOSED'].includes(c.status)) return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (c.complaintNumber || '').toLowerCase().includes(q) ||
        (c.brand?.name || '').toLowerCase().includes(q) ||
        (c.category?.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.status || '').toLowerCase().replace(/_/g, ' ').includes(q);
      if (!match) return false;
    }

    return true;
  });

  const counts = {
    all: data.length,
    active: data.filter((c) => !['CLOSED', 'CANCELLED', 'RESOLVED', 'REPAIR_COMPLETE'].includes(c.status)).length,
    resolved: data.filter((c) => ['RESOLVED', 'REPAIR_COMPLETE', 'CLOSED'].includes(c.status)).length,
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by #, brand, product..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['all', 'active', 'resolved'] as Filter[]).map((f) => {
          const isActive = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
              <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                  {counts[f]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ComplaintCard
            complaint={item}
            onPress={() => navigation.navigate('ComplaintDetail', { id: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          search.trim() ? (
            <EmptyState
              icon="🔍"
              title="No results found"
              subtitle={`No complaints matching "${search}"`}
            />
          ) : (
            <EmptyState
              icon="📋"
              title="No complaints yet"
              subtitle="Your complaints will appear here once submitted"
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  clearText: { fontSize: 12, color: Colors.textMuted, fontWeight: '700' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    backgroundColor: Colors.background,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  tabCount: {
    backgroundColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 1,
    minWidth: 22,
    alignItems: 'center',
  },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabCountText: { fontSize: 11, fontWeight: '800', color: Colors.textMuted },
  tabCountTextActive: { color: Colors.white },

  list: { padding: 20, paddingBottom: 32 },
});
