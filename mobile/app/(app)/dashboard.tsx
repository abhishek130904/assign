import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { userApi } from '../../src/api/user.api';
import Colors from '../../constants/Colors';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    userApi.getMe().then(setProfile).catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      }},
    ]);
  };

  const data = profile || user;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Hello, {data?.name} 👋</Text>

      <View style={styles.card}>
        <Row label="Name" value={data?.name} />
        <Row label="Email" value={data?.email} />
        <Row label="Role" value={
          <View style={[styles.badge, data?.role === 'admin' ? styles.badgeAdmin : styles.badgeUser]}>
            <Text style={styles.badgeText}>{data?.role}</Text>
          </View>
        } />
        <Row label="Email Verified" value={
          <View style={[styles.badge, data?.isEmailVerified ? styles.badgeSuccess : styles.badgeWarn]}>
            <Text style={styles.badgeText}>{data?.isEmailVerified ? 'Verified' : 'Not Verified'}</Text>
          </View>
        } />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Row = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {typeof value === 'string' ? <Text style={styles.rowValue}>{value}</Text> : value}
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, paddingTop: 60 },
  greeting: { fontSize: 26, fontWeight: '700', color: Colors.text, marginBottom: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 12, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 14, color: Colors.textSecondary },
  rowValue: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeAdmin: { backgroundColor: '#EDE9FE' },
  badgeUser: { backgroundColor: '#DBEAFE' },
  badgeSuccess: { backgroundColor: '#DCFCE7' },
  badgeWarn: { backgroundColor: '#FEF9C3' },
  badgeText: { fontSize: 12, fontWeight: '600', color: Colors.text },
  logoutBtn: { marginTop: 32, backgroundColor: Colors.error, borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
