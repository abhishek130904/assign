import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import LoadingOverlay from '../../src/components/LoadingOverlay';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingOverlay />;
  if (!user) return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
