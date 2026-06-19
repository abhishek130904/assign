import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import Colors from '../../constants/Colors';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, onFocus, onBlur, ...props }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null
        ]}
        placeholderTextColor="#475569"
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: 6 },
  input: {
    height: 48, borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, fontSize: 16, color: Colors.text, backgroundColor: Colors.card,
  },
  inputFocused: { borderColor: Colors.primary },
  inputError: { borderColor: Colors.error },
  error: { color: Colors.error, fontSize: 12, marginTop: 4 },
});

export default FormInput;
