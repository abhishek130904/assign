import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authApi } from '../../src/api/auth.api';
import OtpInput from '../../src/components/OtpInput';
import PrimaryButton from '../../src/components/PrimaryButton';
import Colors from '../../constants/Colors';

const RESEND_COOLDOWN = 60;

export default function VerifyEmail() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const verify = async () => {
    if (otp.length < 6) return Alert.alert('Error', 'Enter the 6-digit code');
    setLoading(true);
    try {
      await authApi.verifyEmail(email, otp);
      router.replace({ pathname: '/(auth)/login', params: { verified: '1' } });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Verification failed');
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      await authApi.resendOtp(email, 'email_verification');
      setCountdown(RESEND_COOLDOWN);
      Alert.alert('Sent', 'A new OTP has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {'\n'}<Text style={styles.email}>{email}</Text></Text>
      <OtpInput value={otp} onChange={setOtp} />
      <PrimaryButton title="Verify Email" onPress={verify} loading={loading} style={styles.btn} />
      <TouchableOpacity onPress={resend} disabled={countdown > 0} style={styles.resend}>
        <Text style={[styles.resendText, countdown > 0 ? styles.resendDisabled : null]}>
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 80 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 32, lineHeight: 24 },
  email: { color: Colors.primary, fontWeight: '600' },
  btn: { marginTop: 32 },
  resend: { marginTop: 20, alignItems: 'center' },
  resendText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: Colors.textSecondary },
  back: { marginTop: 16, alignItems: 'center' },
  backText: { color: Colors.textSecondary, fontSize: 14 },
});
