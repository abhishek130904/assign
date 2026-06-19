import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange }) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (text: string, index: number) => {
    // Handle paste — spread across boxes
    if (text.length > 1) {
      const newVal = text.replace(/\D/g, '').slice(0, 6);
      onChange(newVal);
      inputRefs.current[Math.min(newVal.length, 5)]?.focus();
      return;
    }
    const newDigits = [...digits];
    newDigits[index] = text.replace(/\D/g, '');
    const newOtp = newDigits.join('');
    onChange(newOtp);
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputRefs.current[i] = ref; }}
          style={[styles.box, digit ? styles.boxFilled : null]}
          value={digit}
          onChangeText={(text) => handleChange(text, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  box: {
    width: 48, height: 48, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 8, fontSize: 20, fontWeight: '700', color: Colors.text,
    backgroundColor: Colors.card,
  },
  boxFilled: { borderColor: Colors.primary },
});

export default OtpInput;
