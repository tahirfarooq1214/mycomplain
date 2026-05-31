import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';

export function LoginScreen() {
  const { login, verifyOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  async function handleSendOtp() {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    const fullPhone = phone.startsWith('+92') ? phone : `+92${phone}`;
    const result = await login(fullPhone);

    if (result.success) {
      if (result.devOtp) {
        const verifyResult = await verifyOtp(fullPhone, result.devOtp);
        setLoading(false);
        if (!verifyResult.success) {
          Alert.alert('Error', verifyResult.error || 'Auto-verify failed');
        }
        return;
      }
      setLoading(false);
      setStep('otp');
    } else {
      setLoading(false);
      Alert.alert('Error', result.error || 'Failed to send OTP');
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 4) {
      Alert.alert('Error', 'Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    const result = await verifyOtp(phone.startsWith('+92') ? phone : `+92${phone}`, otp);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error || 'Invalid OTP');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Decorative background circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Logo */}
      <Animated.View style={[styles.header, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>📱</Text>
        </View>
        <Text style={styles.appName}>MyComplain</Text>
        <Text style={styles.tagline}>One app for ALL your appliance complaints</Text>
      </Animated.View>

      {/* Form */}
      <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formSlide }] }]}>
        <View style={styles.formCard}>
          {step === 'phone' ? (
            <>
              <Text style={styles.formTitle}>Welcome</Text>
              <Text style={styles.formSubtitle}>Enter your phone number to get started</Text>

              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.flag}>🇵🇰</Text>
                  <Text style={styles.countryCodeText}>+92</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="3XX XXXXXXX"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Connecting...' : 'Continue'}
                </Text>
                {!loading && <Text style={styles.buttonArrow}>  &rarr;</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Verify OTP</Text>
              <Text style={styles.formSubtitle}>Enter the code sent to +92{phone}</Text>

              <TextInput
                style={styles.otpInput}
                placeholder="0  0  0  0"
                placeholderTextColor={Colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                textContentType="oneTimeCode"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.changeBtn} onPress={() => { setStep('phone'); setOtp(''); }}>
                <Text style={styles.changeText}>Change number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>

      <Text style={styles.footer}>
        By continuing, you agree to our Terms of Service & Privacy Policy
      </Text>
      <Text style={styles.brand}>Powered by Qistwalay.com</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1B3D',
    justifyContent: 'center',
    padding: 24,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(59,130,246,0.12)',
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99,102,241,0.1)',
    bottom: 60,
    left: -60,
  },
  header: { alignItems: 'center', marginBottom: 36 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(59,130,246,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: { fontSize: 40 },
  appName: { fontSize: 36, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 6, textAlign: 'center' },

  form: { marginBottom: 24 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    // boxShadow for web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  formTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  formSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 },

  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  flag: { fontSize: 18 },
  countryCodeText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },

  otpInput: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 16,
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    color: Colors.textPrimary,
  },

  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  buttonArrow: { color: Colors.white, fontSize: 17, fontWeight: '800' },

  changeBtn: { alignItems: 'center', marginTop: 16 },
  changeText: { color: Colors.primaryLight, fontSize: 14, fontWeight: '600' },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 18,
  },
  brand: {
    textAlign: 'center',
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 8,
  },
});
