import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { brands as brandsApi, categories as categoriesApi, complaints as complaintsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PRODUCT_CATEGORIES, ISSUE_TYPES } from '@mycomplain/shared';
import * as ImagePicker from 'expo-image-picker';

type Step = 'service_type' | 'brand' | 'product' | 'warranty' | 'issue';

export function NewComplaintScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('service_type');
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);

  // Form state
  const [serviceType, setServiceType] = useState<string>(route.params?.serviceType || '');
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseSource, setPurchaseSource] = useState('');
  const [dealerName, setDealerName] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [serviceAddress, setServiceAddress] = useState(user?.address || '');
  const [images, setImages] = useState<{ uri: string; name: string; type: string }[]>([]);

  async function pickImages() {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please allow access to your photo library');
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 5 - images.length,
      });
      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `photo-${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
        }));
        setImages((prev) => [...prev, ...newImages].slice(0, 5));
      }
    } catch (e) {
      console.log('Image pick error:', e);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  useEffect(() => {
    loadBrands();
    if (route.params?.serviceType) {
      setServiceType(route.params.serviceType);
      setStep(route.params.serviceType === 'brand_warranty' ? 'brand' : 'product');
    }
  }, []);

  async function loadBrands() {
    const result = await brandsApi.getAll();
    if (result.success && result.data) setBrands(result.data as any[]);
  }

  function nextStep() {
    const steps: Step[] = serviceType === 'brand_warranty'
      ? ['service_type', 'brand', 'product', 'warranty', 'issue']
      : ['service_type', 'product', 'issue']; // Third-party skips brand & warranty
    const currentIdx = steps.indexOf(step);
    if (currentIdx < steps.length - 1) setStep(steps[currentIdx + 1]);
  }

  function prevStep() {
    const steps: Step[] = serviceType === 'brand_warranty'
      ? ['service_type', 'brand', 'product', 'warranty', 'issue']
      : ['service_type', 'product', 'issue'];
    const currentIdx = steps.indexOf(step);
    if (currentIdx > 0) setStep(steps[currentIdx - 1]);
    else navigation.goBack();
  }

  async function handleSubmit() {
    if (!selectedCategory || !issueType || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const result = await complaintsApi.create({
      serviceType: serviceType === 'brand_warranty' ? 'BRAND_WARRANTY' : 'THIRD_PARTY',
      brandId: selectedBrand?.id || null,
      categoryId: selectedCategory.id,
      modelNumber,
      serialNumber,
      issueType: issueType.toUpperCase(),
      description,
      preferredTime: preferredTime ? preferredTime.toUpperCase() : null,
      purchaseDate: purchaseDate || null,
      purchaseSource: purchaseSource ? purchaseSource.toUpperCase() : null,
      dealerName,
      serviceAddress,
    });
    setLoading(false);

    if (result.success) {
      const complaintId = (result.data as any)?.id;
      // Upload images if any
      if (images.length > 0 && complaintId) {
        await complaintsApi.uploadMedia(complaintId, images);
      }
      Alert.alert(
        'Complaint Registered! ✅',
        `Your complaint ${(result.data as any)?.complaintNumber} has been submitted${images.length > 0 ? ` with ${images.length} photo(s)` : ''}. We'll keep you updated on the progress.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to submit complaint');
    }
  }

  // ── STEP RENDERERS ──────────────────────────────────────────

  function renderServiceType() {
    return (
      <View>
        <Text style={styles.stepTitle}>Select Service Type</Text>
        <Text style={styles.stepSubtitle}>How would you like your appliance serviced?</Text>

        <TouchableOpacity
          style={[styles.serviceCard, serviceType === 'brand_warranty' && styles.serviceCardSelected,
            { borderColor: Colors.brandService }]}
          onPress={() => { setServiceType('brand_warranty'); }}
        >
          <Text style={styles.serviceIcon}>🏢</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>Brand Warranty Service</Text>
            <Text style={styles.serviceDesc}>
              We'll register your complaint directly with the brand's official service center
            </Text>
            <View style={styles.serviceTags}>
              <Text style={styles.tag}>✓ Free under warranty</Text>
              <Text style={styles.tag}>✓ Official parts</Text>
              <Text style={styles.tag}>✓ Brand guarantee</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.serviceCard, serviceType === 'third_party' && styles.serviceCardSelected,
            { borderColor: Colors.thirdParty }]}
          onPress={() => { setServiceType('third_party'); }}
        >
          <Text style={styles.serviceIcon}>🔧</Text>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>Third-Party Repair Service</Text>
            <Text style={styles.serviceDesc}>
              Out of warranty or want affordable repair? Our verified service providers will fix it
            </Text>
            <View style={styles.serviceTags}>
              <Text style={styles.tag}>✓ Up to 50% cheaper</Text>
              <Text style={styles.tag}>✓ Verified providers</Text>
              <Text style={styles.tag}>✓ 30-day guarantee</Text>
            </View>
          </View>
        </TouchableOpacity>

        {serviceType !== '' && (
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>Continue →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderBrandSelect() {
    return (
      <View>
        <Text style={styles.stepTitle}>Select Brand</Text>
        <Text style={styles.stepSubtitle}>Which brand is your appliance?</Text>

        <View style={styles.brandGrid}>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={[styles.brandCard, selectedBrand?.id === brand.id && styles.brandCardSelected]}
              onPress={() => setSelectedBrand(brand)}
            >
              <Text style={styles.brandName}>{brand.name}</Text>
              {brand.integrationTier === 'EMAIL' || brand.integrationTier === 'WHATSAPP' ? (
                <Text style={styles.brandAuto}>⚡ Auto-routing</Text>
              ) : (
                <Text style={styles.brandManual}>☎ Team-assisted</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {selectedBrand && (
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>Continue →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderProductInfo() {
    return (
      <View>
        <Text style={styles.stepTitle}>Product Information</Text>

        <Text style={styles.label}>Product Category *</Text>
        <View style={styles.categoryGrid}>
          {PRODUCT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory?.id === cat.id && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryName, selectedCategory?.id === cat.id && styles.categoryNameSelected]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Model Number</Text>
        <TextInput style={styles.input} placeholder="e.g., HRF-368EBS" value={modelNumber} onChangeText={setModelNumber} />
        <Text style={styles.hint}>💡 Usually found on the back or side of your appliance</Text>

        <Text style={styles.label}>Serial Number (optional)</Text>
        <TextInput style={styles.input} placeholder="Serial number" value={serialNumber} onChangeText={setSerialNumber} />

        {selectedCategory && (
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>Continue →</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function renderWarrantyInfo() {
    const sources = [
      { id: 'official_store', label: 'Official Brand Store' },
      { id: 'authorized_dealer', label: 'Authorized Dealer' },
      { id: 'online', label: 'Online (Daraz / Qistwalay)' },
      { id: 'other', label: 'Other' },
    ];

    return (
      <View>
        <Text style={styles.stepTitle}>Warranty & Purchase</Text>

        <Text style={styles.label}>Purchase Date</Text>
        <TextInput style={styles.input} placeholder="DD/MM/YYYY" value={purchaseDate} onChangeText={setPurchaseDate} />

        <Text style={styles.label}>Purchase Source</Text>
        {sources.map((src) => (
          <TouchableOpacity
            key={src.id}
            style={[styles.radioRow, purchaseSource === src.id && styles.radioRowSelected]}
            onPress={() => setPurchaseSource(src.id)}
          >
            <View style={[styles.radio, purchaseSource === src.id && styles.radioSelected]} />
            <Text style={styles.radioLabel}>{src.label}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Dealer / Store Name</Text>
        <TextInput style={styles.input} placeholder="e.g., Qistwalay.com" value={dealerName} onChangeText={setDealerName} />

        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderIssueDescription() {
    const times = [
      { id: 'morning', label: '☀️ Morning (9AM-12PM)' },
      { id: 'afternoon', label: '🌤 Afternoon (12PM-4PM)' },
      { id: 'evening', label: '🌙 Evening (4PM-7PM)' },
    ];

    return (
      <View>
        <Text style={styles.stepTitle}>Describe the Issue</Text>

        <Text style={styles.label}>Issue Type *</Text>
        <View style={styles.categoryGrid}>
          {ISSUE_TYPES.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              style={[styles.categoryChip, issueType === issue.id && styles.categoryChipSelected]}
              onPress={() => setIssueType(issue.id)}
            >
              <Text style={styles.categoryIcon}>{issue.icon}</Text>
              <Text style={[styles.categoryName, issueType === issue.id && styles.categoryNameSelected]}>
                {issue.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Describe the problem *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Explain what's happening with your appliance..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Image Upload */}
        <Text style={styles.label}>Attach Photos (optional)</Text>
        <Text style={styles.hint}>Add up to 5 photos of the issue to help with diagnosis</Text>
        <View style={styles.imageSection}>
          <View style={styles.imageRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageThumb}>
                <Image source={{ uri: img.uri }} style={styles.thumbImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Text style={styles.addImageIcon}>📷</Text>
                <Text style={styles.addImageText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          {images.length > 0 && (
            <Text style={styles.imageCount}>{images.length}/5 photos added</Text>
          )}
        </View>

        {serviceType === 'third_party' && (
          <>
            <Text style={styles.label}>Service Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Where should the technician visit?"
              value={serviceAddress}
              onChangeText={setServiceAddress}
              multiline
              numberOfLines={2}
            />
          </>
        )}

        <Text style={styles.label}>Preferred Visit Time</Text>
        {times.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.radioRow, preferredTime === t.id && styles.radioRowSelected]}
            onPress={() => setPreferredTime(t.id)}
          >
            <View style={[styles.radio, preferredTime === t.id && styles.radioSelected]} />
            <Text style={styles.radioLabel}>{t.label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Complaint ✓'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── MAIN RENDER ─────────────────────────────────────────────

  const stepRenderers: Record<Step, () => JSX.Element> = {
    service_type: renderServiceType,
    brand: renderBrandSelect,
    product: renderProductInfo,
    warranty: renderWarrantyInfo,
    issue: renderIssueDescription,
  };

  const allSteps: Step[] = serviceType === 'brand_warranty'
    ? ['service_type', 'brand', 'product', 'warranty', 'issue']
    : ['service_type', 'product', 'issue'];
  const currentStepIdx = allSteps.indexOf(step);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        {allSteps.map((s, i) => (
          <View key={s} style={styles.stepDotRow}>
            <View style={[styles.stepDot, i <= currentStepIdx && styles.stepDotActive]} />
            {i < allSteps.length - 1 && <View style={[styles.stepLine, i < currentStepIdx && styles.stepLineActive]} />}
          </View>
        ))}
      </View>

      {/* Back button */}
      {currentStepIdx > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      {stepRenderers[step]()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 20, paddingBottom: 40 },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  stepDotRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.primary, width: 12, height: 12, borderRadius: 6 },
  stepLine: { width: 30, height: 2, backgroundColor: Colors.border },
  stepLineActive: { backgroundColor: Colors.primary },
  backButton: { marginBottom: 12 },
  backButtonText: { color: Colors.primaryLight, fontSize: 14, fontWeight: '600' },
  stepTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  // Service type cards
  serviceCard: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: Colors.border, marginBottom: 12, backgroundColor: Colors.background },
  serviceCardSelected: { backgroundColor: '#EFF6FF', borderColor: Colors.primary },
  serviceIcon: { fontSize: 36, marginRight: 14, marginTop: 4 },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  serviceDesc: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8, lineHeight: 18 },
  serviceTags: { gap: 2 },
  tag: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  // Brand grid
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  brandCard: { width: '30%', padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.background },
  brandCardSelected: { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  brandName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  brandAuto: { fontSize: 9, color: Colors.success, fontWeight: '600' },
  brandManual: { fontSize: 9, color: Colors.warning, fontWeight: '600' },
  // Category grid
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  categoryChipSelected: { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  categoryIcon: { fontSize: 16, marginRight: 4 },
  categoryName: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  categoryNameSelected: { color: Colors.primary },
  // Form fields
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: Colors.background, borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 4 },
  textArea: { height: 100, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: Colors.textMuted, marginBottom: 8 },
  // Radio
  radioRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 6, backgroundColor: Colors.background },
  radioRowSelected: { backgroundColor: '#EFF6FF' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border, marginRight: 10 },
  radioSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  radioLabel: { fontSize: 14, color: Colors.textPrimary },
  // Buttons
  nextButton: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  nextButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  submitButton: { backgroundColor: Colors.success, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  submitButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  // Image upload
  imageSection: { marginBottom: 8 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageThumb: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative' as const },
  thumbImage: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute' as const, top: 2, right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)', width: 22, height: 22,
    borderRadius: 11, alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  removeImageText: { color: '#fff', fontSize: 12, fontWeight: '700' as const },
  addImageBtn: {
    width: 80, height: 80, borderRadius: 12,
    borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed' as const,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    backgroundColor: Colors.background,
  },
  addImageIcon: { fontSize: 24, marginBottom: 2 },
  addImageText: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' as const },
  imageCount: { fontSize: 12, color: Colors.textMuted, marginTop: 6, fontWeight: '500' as const },
});
