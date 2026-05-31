import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../services/api';

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
];

export function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [area, setArea] = useState(user?.area || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    setLoading(true);
    const result = await users.updateProfile({ fullName, email, city, area, address });
    setLoading(false);

    if (result.success) {
      updateUser({ fullName, email, city, area, address });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      Alert.alert('Saved!', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to save profile');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(fullName || '?')[0].toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      {/* Form */}
      <View style={styles.formCard}>
        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor={Colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>City</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowCities(!showCities)} activeOpacity={0.7}>
            <Text style={city ? styles.inputText : styles.placeholderText}>
              {city || 'Select city'}
            </Text>
            <Text style={styles.dropdownArrow}>{showCities ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showCities && (
            <View style={styles.dropdown}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.dropdownItem, city === c && styles.dropdownItemActive]}
                  onPress={() => { setCity(c); setShowCities(false); }}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.dropdownText, city === c && styles.dropdownTextActive]}>
                    {city === c ? `✓  ${c}` : c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Area / Town</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., DHA Phase 5, Gulberg"
            placeholderTextColor={Colors.textMuted}
            value={area}
            onChangeText={setArea}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="House/Apartment, Street, Block..."
            placeholderTextColor={Colors.textMuted}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.hint}>Used as default service address for complaints</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.saveBtnText}>
          {loading ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#FFF' },
  phone: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },

  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.background, borderRadius: 14,
    padding: 15, fontSize: 16, borderWidth: 1.5, borderColor: Colors.border,
    color: Colors.textPrimary, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inputText: { fontSize: 16, color: Colors.textPrimary },
  placeholderText: { fontSize: 16, color: Colors.textMuted },
  dropdownArrow: { fontSize: 10, color: Colors.textMuted },
  textArea: { height: 90, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: Colors.textMuted, marginTop: 6 },

  dropdown: {
    backgroundColor: Colors.white, borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.border, marginTop: 6, maxHeight: 220,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  dropdownItemActive: { backgroundColor: Colors.background },
  dropdownText: { fontSize: 15, color: Colors.textPrimary },
  dropdownTextActive: { color: Colors.primary, fontWeight: '700' },

  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 16,
    padding: 17, alignItems: 'center', marginTop: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
});
