import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { authApi } from '../../src/api/auth.api';
import FormInput from '../../src/components/FormInput';
import PrimaryButton from '../../src/components/PrimaryButton';
import Colors from '../../constants/Colors';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email) return Alert.alert('Error', 'Enter your email');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true); // Still show success to avoid email enumeration
    } finally { setLoading(false); }
  };

  if (sent) return (
    <View style={styles.screen}>
      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>If this email is registered, you'll receive a reset link shortly.</Text>
      <TouchableOpacity onPress={() => router.replace('/(auth)/login')}><Text style={styles.link}>Back to login</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send you a reset link.</Text>
      <FormInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
      <PrimaryButton title="Send Reset Link" onPress={submit} loading={loading} />
      <TouchableOpacity onPress={() => router.back()} style={styles.back}><Text style={styles.link}>← Back</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 80 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 32, lineHeight: 24 },
  back: { marginTop: 16, alignItems: 'center' },
  link: { color: Colors.primary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
