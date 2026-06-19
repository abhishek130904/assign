import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import LoadingOverlay from '../src/components/LoadingOverlay';

export default function Index() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingOverlay />;
  return <Redirect href={user ? '/(app)/dashboard' : '/(auth)/login'} />;
}
