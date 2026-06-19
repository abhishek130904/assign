import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, error, secureTextEntry, onFocus, onBlur, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isFocused ? styles.inputFocused : null,
            error ? styles.inputError : null,
            secureTextEntry ? { paddingRight: 44 } : null
          ]}
          secureTextEntry={isSecure}
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
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsSecure(!isSecure)}
            activeOpacity={0.7}
          >
            <Feather
              name={isSecure ? "eye-off" : "eye"}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.text, marginBottom: 6 },
  inputContainer: { justifyContent: 'center' },
  input: {
    height: 48, borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, fontSize: 16, color: Colors.text, backgroundColor: Colors.card,
    width: '100%',
  },
  inputFocused: { borderColor: Colors.primary },
  inputError: { borderColor: Colors.error },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  error: { color: Colors.error, fontSize: 12, marginTop: 4 },
});

export default FormInput;
