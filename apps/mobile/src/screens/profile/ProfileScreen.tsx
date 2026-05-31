import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  icon: string;
  label: string;
  value: string;
  action?: () => void;
}

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  }

  const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Settings',
      items: [
        { icon: '✏️', label: 'Edit Profile', value: '', action: () => navigation.navigate('EditProfile') },
        { icon: '🔔', label: 'Notifications', value: 'Enabled', action: () => Alert.alert('Notifications', 'Push notifications are enabled. You\'ll receive real-time updates on your complaints.') },
        { icon: '🌐', label: 'Language', value: 'English', action: () => Alert.alert('Language', 'Only English is available in this version. Urdu support coming soon!') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help & Support', value: '', action: () => navigation.navigate('HelpSupport') },
        { icon: '⭐', label: 'Rate MyComplain', value: '', action: () => Alert.alert('Rate Us', 'Thanks for using MyComplain! Rating will be available once the app is on the Play Store.') },
        { icon: '📄', label: 'Terms & Privacy', value: '', action: () => Linking.openURL('https://qistwalay.com/privacy') },
        { icon: 'ℹ️', label: 'About', value: 'v1.0.0' },
      ],
    },
  ];

  const initials = (user?.fullName || '?')[0].toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => navigation.navigate('EditProfile')}
        activeOpacity={0.8}
      >
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.fullName || 'User'}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        {user?.email && <Text style={styles.email}>{user.email}</Text>}
        {user?.city && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{user.city}{user.area ? `, ${user.area}` : ''}</Text>
          </View>
        )}
        <View style={styles.editHint}>
          <Text style={styles.editHintText}>Tap to edit profile</Text>
        </View>
      </TouchableOpacity>

      {/* Menu Sections */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
                activeOpacity={0.6}
                onPress={item.action}
              >
                <View style={styles.menuIconBg}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
                {item.value ? <Text style={styles.menuValue}>{item.value}</Text> : null}
                <Text style={styles.menuArrow}>&#8250;</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Sign Out */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Powered by Qistwalay.com</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },

  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#FFFFFF' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  phone: { fontSize: 14, color: Colors.textSecondary, marginTop: 3, fontWeight: '500' },
  email: { fontSize: 14, color: Colors.textMuted, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  locationIcon: { fontSize: 14 },
  location: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
  editHint: {
    marginTop: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  editHintText: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600' },

  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingLeft: 4,
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIcon: { fontSize: 18 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  menuValue: { fontSize: 13, color: Colors.textMuted, marginRight: 6, fontWeight: '500' },
  menuArrow: { fontSize: 22, color: Colors.textMuted, fontWeight: '300' },

  logoutBtn: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  logoutText: { color: Colors.error, fontSize: 16, fontWeight: '700' },

  footer: { textAlign: 'center', fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
});
