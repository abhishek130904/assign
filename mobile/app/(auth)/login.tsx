import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { authApi } from '../../src/api/auth.api';
import FormInput from '../../src/components/FormInput';
import PrimaryButton from '../../src/components/PrimaryButton';
import Colors from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';

export default function Login() {
  const { setTokens } = useAuth();
  const params = useLocalSearchParams<{ verified?: string }>();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const data = await authApi.login(form.email, form.password);
      if (data.requiresOtp) {
        router.push({ pathname: '/(auth)/verify-email', params: { email: form.email, purpose: 'login_mfa' } });
      } else {
        await setTokens(data.accessToken, data.refreshToken, {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        router.replace('/(app)/dashboard');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.screen}>
      {params.verified && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ Email verified! You can now log in.</Text>
        </View>
      )}
      <View style={{ alignItems: 'flex-start', marginBottom: 24 }}>
        <Feather name="shield" size={44} color={Colors.primary} style={{ marginBottom: 16 }} />
      </View>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>
      <FormInput label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
      <FormInput label="Password" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} secureTextEntry placeholder="Your password" />
      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgot}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>
      <PrimaryButton title="Sign In" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
      <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 32 },
  forgot: { alignSelf: 'flex-end', marginBottom: 16, marginTop: -8 },
  forgotText: { color: Colors.primary, fontSize: 14 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: Colors.textSecondary, fontSize: 14 },
  linkBold: { color: Colors.primary, fontWeight: '600' },
  successBanner: { backgroundColor: '#DCFCE7', borderRadius: 8, padding: 12, marginBottom: 24 },
  successText: { color: '#166534', fontWeight: '500' },
});
