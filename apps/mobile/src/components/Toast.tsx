import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface ToastMessage {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

let addToastFn: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null;

export function showToast(msg: Omit<ToastMessage, 'id'>) {
  if (addToastFn) addToastFn(msg);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (msg) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { ...msg, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() =>
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          } />
        ))}
      </View>
    </View>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onDismiss());
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const icons: Record<string, string> = {
    success: '✅', info: 'ℹ️', warning: '⚠️', error: '❌',
  };

  const bgColors: Record<string, string> = {
    success: '#F0FDF4', info: '#EFF6FF', warning: '#FFFBEB', error: '#FEF2F2',
  };

  const borderColors: Record<string, string> = {
    success: '#BBF7D0', info: '#BFDBFE', warning: '#FDE68A', error: '#FECACA',
  };

  return (
    <Animated.View style={[styles.toast, {
      transform: [{ translateY }],
      opacity,
      backgroundColor: bgColors[toast.type],
      borderColor: borderColors[toast.type],
    }]}>
      <TouchableOpacity style={styles.toastContent} onPress={onDismiss} activeOpacity={0.8}>
        <Text style={styles.toastIcon}>{icons[toast.type]}</Text>
        <View style={styles.toastText}>
          <Text style={styles.toastTitle}>{toast.title}</Text>
          <Text style={styles.toastBody} numberOfLines={2}>{toast.body}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  toast: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  toastIcon: { fontSize: 20 },
  toastText: { flex: 1 },
  toastTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  toastBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
