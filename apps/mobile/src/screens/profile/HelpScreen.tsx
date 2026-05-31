import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Colors } from '../../constants/colors';

const FAQ = [
  {
    q: 'How do I register a complaint?',
    a: 'Tap the "New" button in the bottom tab bar, select your service type (Brand Warranty or Third-Party Repair), fill in the product and issue details, attach photos if needed, and submit. You\'ll get a complaint number to track progress.',
  },
  {
    q: 'What is the difference between Brand Warranty and Third-Party Repair?',
    a: 'Brand Warranty routes your complaint to the official brand service center — ideal if your product is under warranty. Third-Party Repair connects you with our verified local technicians, often faster and more affordable for out-of-warranty products.',
  },
  {
    q: 'How do I track my complaint?',
    a: 'Go to "My Requests" tab to see all your complaints. Tap any complaint to view the full timeline, current status, and any updates. You\'ll also receive real-time notifications when the status changes.',
  },
  {
    q: 'Can I attach photos to my complaint?',
    a: 'Yes! On the last step of complaint submission, you can attach up to 5 photos showing the issue. This helps technicians diagnose the problem faster.',
  },
  {
    q: 'What if I\'m not satisfied with the service?',
    a: 'You can escalate any active complaint using the "Escalate" button on the complaint detail page. Our team will prioritize your case and ensure a resolution.',
  },
  {
    q: 'How do I approve or decline a repair quote?',
    a: 'For Third-Party Repair complaints, when the provider sends a quote, you\'ll see it on your complaint detail page with "Approve" and "Decline" buttons. You have full control.',
  },
];

export function HelpScreen() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.headerIcon}>💬</Text>
        <Text style={styles.headerTitle}>How can we help?</Text>
        <Text style={styles.headerSub}>Find answers to common questions below</Text>
      </View>

      {/* Contact Options */}
      <Text style={styles.sectionTitle}>Contact Us</Text>
      <View style={styles.contactGrid}>
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL('tel:+921234567890')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIconBg, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.contactIcon}>📞</Text>
          </View>
          <Text style={styles.contactLabel}>Call Us</Text>
          <Text style={styles.contactValue}>+92 123 456 7890</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL('mailto:support@mycomplain.pk')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIconBg, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.contactIcon}>📧</Text>
          </View>
          <Text style={styles.contactLabel}>Email</Text>
          <Text style={styles.contactValue}>support@mycomplain.pk</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL('https://wa.me/921234567890')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIconBg, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.contactIcon}>💬</Text>
          </View>
          <Text style={styles.contactLabel}>WhatsApp</Text>
          <Text style={styles.contactValue}>Chat with us</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL('https://qistwalay.com')}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIconBg, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.contactIcon}>🌐</Text>
          </View>
          <Text style={styles.contactLabel}>Website</Text>
          <Text style={styles.contactValue}>qistwalay.com</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      <View style={styles.faqCard}>
        {FAQ.map((faq, i) => {
          const isExpanded = expandedIdx === i;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.faqItem, i < FAQ.length - 1 && styles.faqBorder]}
              onPress={() => setExpandedIdx(isExpanded ? null : i)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Text style={styles.faqArrow}>{isExpanded ? '▲' : '▼'}</Text>
              </View>
              {isExpanded && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>MyComplain v1.0.0</Text>
        <Text style={styles.footerText}>Powered by Qistwalay.com</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },

  headerCard: {
    backgroundColor: Colors.primary,
    borderRadius: 22, padding: 28,
    alignItems: 'center', marginBottom: 24,
  },
  headerIcon: { fontSize: 40, marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: -0.3 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 12, paddingLeft: 4,
  },

  contactGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28,
  },
  contactCard: {
    width: '47%', backgroundColor: Colors.white,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  contactIconBg: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  contactIcon: { fontSize: 20 },
  contactLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  contactValue: { fontSize: 12, color: Colors.textMuted },

  faqCard: {
    backgroundColor: Colors.white, borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    marginBottom: 24,
  },
  faqItem: { padding: 16 },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary, lineHeight: 22, paddingRight: 12 },
  faqArrow: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  faqAnswer: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, marginTop: 10 },

  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
});
