import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { complaints as complaintsApi } from '../../services/api';
import { ComplaintCard } from '../../components/ComplaintCard';
import { CardSkeleton, SectionHeader, EmptyState } from '../../components/UIKit';

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [activeComplaints, setActiveComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Refresh complaints when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [])
  );

  async function loadComplaints() {
    setLoading(true);
    const result = await complaintsApi.getAll();
    if (result.success && result.data) {
      const active = (result.data as any[]).filter(
        (c: any) => !['CLOSED', 'CANCELLED'].includes(c.status)
      );
      setActiveComplaints(active.slice(0, 5));
    }
    setLoading(false);
  }

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadComplaints} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting Header */}
      <Animated.View style={[styles.greetingSection, { opacity: fadeAnim }]}>
        <Text style={styles.greetingSmall}>{greeting}</Text>
        <Text style={styles.greetingName}>{firstName} 👋</Text>
      </Animated.View>

      {/* Service Type Cards */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('New Request', { serviceType: 'brand_warranty' })}
          activeOpacity={0.85}
        >
          <View style={[styles.actionGradient, { backgroundColor: '#4F46E5' }]}>
            <View style={styles.actionBgCircle} />
            <Text style={styles.actionIcon}>🏢</Text>
            <Text style={styles.actionTitle}>Brand{'\n'}Warranty</Text>
            <Text style={styles.actionDesc}>Official service center</Text>
            <View style={styles.actionArrow}>
              <Text style={styles.actionArrowText}>&rarr;</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('New Request', { serviceType: 'third_party' })}
          activeOpacity={0.85}
        >
          <View style={[styles.actionGradient, { backgroundColor: '#059669' }]}>
            <View style={[styles.actionBgCircle, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
            <Text style={styles.actionIcon}>🔧</Text>
            <Text style={styles.actionTitle}>Third-Party{'\n'}Repair</Text>
            <Text style={styles.actionDesc}>Affordable & verified</Text>
            <View style={styles.actionArrow}>
              <Text style={styles.actionArrowText}>&rarr;</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Active Complaints */}
      <SectionHeader
        title="Active Requests"
        count={activeComplaints.length}
        actionLabel={activeComplaints.length > 0 ? 'See All' : undefined}
        onAction={() => navigation.navigate('My Requests')}
      />

      {loading ? (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      ) : activeComplaints.length === 0 ? (
        <EmptyState
          icon="✨"
          title="No active requests"
          subtitle="All your appliances are running fine!"
        />
      ) : (
        activeComplaints.map((complaint) => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
            onPress={() => navigation.navigate('ComplaintDetail', { id: complaint.id })}
          />
        ))
      )}

      {/* How it works */}
      <View style={styles.howItWorks}>
        <Text style={styles.howTitle}>How MyComplain Works</Text>
        {[
          { num: '1', icon: '📝', text: 'Select service type and fill in details' },
          { num: '2', icon: '🔄', text: 'We route your complaint automatically' },
          { num: '3', icon: '✅', text: 'Track progress in real-time until resolved' },
        ].map((step, i) => (
          <View key={i} style={styles.howStep}>
            <View style={styles.howNumBg}>
              <Text style={styles.howNum}>{step.num}</Text>
            </View>
            <View style={styles.howContent}>
              <Text style={styles.howIcon}>{step.icon}</Text>
              <Text style={styles.howText}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, overflow: 'scroll' as any },
  content: { padding: 20, paddingBottom: 60, flexGrow: 1 },

  greetingSection: { marginBottom: 24 },
  greetingSmall: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  greetingName: { fontSize: 28, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5, marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 14, marginBottom: 28 },
  actionCard: { flex: 1 },
  actionGradient: {
    borderRadius: 22,
    padding: 18,
    minHeight: 170,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  actionBgCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -30,
    right: -30,
  },
  actionIcon: { fontSize: 36, marginBottom: 10 },
  actionTitle: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', lineHeight: 24, letterSpacing: -0.3 },
  actionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  actionArrow: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  actionArrowText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  howItWorks: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 22,
    marginTop: 16,
  },
  howTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  howStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  howNumBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  howNum: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  howContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  howIcon: { fontSize: 18 },
  howText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, flex: 1 },
});
