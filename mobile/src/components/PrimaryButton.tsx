import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import Colors from '../../constants/Colors';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, loading, disabled, ...props }) => (
  <TouchableOpacity style={[styles.btn, (disabled || loading) ? styles.btnDisabled : null]} disabled={disabled || loading} {...props}>
    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    height: 48, backgroundColor: Colors.primary, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default PrimaryButton;
