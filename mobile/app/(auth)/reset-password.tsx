import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authApi } from '../../src/api/auth.api';
import FormInput from '../../src/components/FormInput';
import PrimaryButton from '../../src/components/PrimaryButton';
import Colors from '../../constants/Colors';

export default function ResetPassword() {
  const { token, email } = useLocalSearchParams<{ token: string; email: string }>();
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.newPassword.length < 8) e.newPassword = 'Min 8 characters';
    else if (!/\d/.test(form.newPassword)) e.newPassword = 'Must contain a number';
    if (form.newPassword !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.resetPassword(email, token, form.newPassword);
      Alert.alert('Success', 'Password reset! Please log in.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password below.</Text>
      <FormInput label="New Password" value={form.newPassword} onChangeText={(t) => setForm({ ...form, newPassword: t })} secureTextEntry placeholder="Min 8 chars + 1 number" error={errors.newPassword} />
      <FormInput label="Confirm Password" value={form.confirm} onChangeText={(t) => setForm({ ...form, confirm: t })} secureTextEntry placeholder="Repeat password" error={errors.confirm} />
      <PrimaryButton title="Reset Password" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 80 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 32 },
});
