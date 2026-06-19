import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { authApi } from '../../src/api/auth.api';
import FormInput from '../../src/components/FormInput';
import PrimaryButton from '../../src/components/PrimaryButton';
import Colors from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Min 8 characters';
    else if (!/\d/.test(form.password)) e.password = 'Must contain a number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register(form.name, form.email, form.password);
      router.push({ pathname: '/(auth)/verify-email', params: { email: form.email } });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={{ alignItems: 'flex-start', marginBottom: 20 }}>
        <Feather name="user-plus" size={44} color={Colors.primary} style={{ marginBottom: 16 }} />
      </View>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>
      <FormInput label="Full Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="John Doe" error={errors.name} />
      <FormInput label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
      <FormInput label="Password" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} placeholder="Min 8 chars + 1 number" secureTextEntry error={errors.password} />
      <FormInput label="Confirm Password" value={form.confirm} onChangeText={(t) => setForm({ ...form, confirm: t })} placeholder="Repeat password" secureTextEntry error={errors.confirm} />
      <PrimaryButton title="Create Account" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
      <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.link}>
        <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign in</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 32 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: Colors.textSecondary, fontSize: 14 },
  linkBold: { color: Colors.primary, fontWeight: '600' },
});
