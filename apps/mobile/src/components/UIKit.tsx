import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../constants/colors';

// ── SKELETON LOADER ──────────────────────────────────────
export function Skeleton({ width, height = 16, borderRadius = 8, style }: {
  width: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: '#E2E8F0', opacity },
        style,
      ]}
    />
  );
}

// ── LOADING CARD SKELETON ─────────────────────────────────
export function CardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.row}>
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={60} height={14} />
      </View>
      <Skeleton width="70%" height={18} style={{ marginTop: 12 }} />
      <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
      <View style={[skeletonStyles.row, { marginTop: 14 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Skeleton width={8} height={8} borderRadius={4} />
          <Skeleton width={100} height={14} />
        </View>
        <Skeleton width={90} height={12} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

// ── SECTION HEADER ────────────────────────────────────────
export function SectionHeader({ title, count, actionLabel, onAction }: {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.left}>
        <Text style={headerStyles.title}>{title}</Text>
        {count !== undefined && (
          <View style={headerStyles.countBadge}>
            <Text style={headerStyles.countText}>{count}</Text>
          </View>
        )}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.6}>
          <Text style={headerStyles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  action: { fontSize: 14, color: Colors.primaryLight, fontWeight: '700' },
});

// ── EMPTY STATE ───────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[emptyStyles.container, { opacity, transform: [{ scale }] }]}>
      <Text style={emptyStyles.icon}>{icon}</Text>
      <Text style={emptyStyles.title}>{title}</Text>
      {subtitle && <Text style={emptyStyles.subtitle}>{subtitle}</Text>}
    </Animated.View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
