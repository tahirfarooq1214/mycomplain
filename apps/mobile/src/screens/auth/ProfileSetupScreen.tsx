import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../services/api';

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur'];

export function ProfileSetupScreen() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [area, setArea] = useState(user?.area || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [showCities, setShowCities] = useState(false);

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    const result = await users.updateProfile({ fullName, email, city, area, address });
    setLoading(false);

    if (result.success) {
      updateUser({ fullName, email, city, area, address });
    } else {
      Alert.alert('Error', result.error || 'Failed to save profile');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={styles.input} placeholder="Your full name" value={fullName} onChangeText={setFullName} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email (optional)</Text>
        <TextInput style={styles.input} placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>City</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowCities(!showCities)}>
          <Text style={city ? styles.inputText : styles.placeholder}>{city || 'Select city'}</Text>
        </TouchableOpacity>
        {showCities && (
          <View style={styles.dropdown}>
            {CITIES.map((c) => (
              <TouchableOpacity key={c} style={styles.dropdownItem} onPress={() => { setCity(c); setShowCities(false); }}>
                <Text style={[styles.dropdownText, city === c && styles.dropdownSelected]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Area / Town</Text>
        <TextInput style={styles.input} placeholder="e.g., DHA Phase 5" value={area} onChangeText={setArea} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Full Address</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="House/Building, Street, etc." value={address} onChangeText={setAddress} multiline numberOfLines={3} />
      </View>

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  input: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: Colors.border },
  inputText: { fontSize: 16, color: Colors.textPrimary },
  placeholder: { fontSize: 16, color: Colors.textMuted },
  textArea: { height: 80, textAlignVertical: 'top' },
  dropdown: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginTop: 4, maxHeight: 200 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  dropdownText: { fontSize: 14, color: Colors.textPrimary },
  dropdownSelected: { color: Colors.primary, fontWeight: 'bold' },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});
