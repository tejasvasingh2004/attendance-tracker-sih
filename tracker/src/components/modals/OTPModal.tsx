import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';

interface OTPModalProps {
  visible: boolean;
  userId: string;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default ({ visible, onClose, onSuccess }: OTPModalProps) => {
  const [otp, setOtp] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  const handleVerifyOtp = (code?: string) => {
    const otpToVerify = code || otp;
    console.log('Verifying OTP:', otpToVerify);
    if (otpToVerify.length === 6) {
      onSuccess();
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    const otpString = newOtpValues.join('');
    setOtp(otpString);

    if (otpString.length === 6) {
      handleVerifyOtp(otpString);
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Enter OTP</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.description}>
              Please enter the 6-digit OTP sent to your registered email
              address.
            </Text>
            <View style={styles.otpContainer}>
              {otpValues.map((value, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.input,
                    value ? styles.filledInput : styles.emptyInput,
                  ]}
                  value={value}
                  onChangeText={text => {
                    // Only allow single digit
                    if (text.length <= 1) {
                      handleOtpChange(text, index);
                    }
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    handleKeyPress(nativeEvent.key, index);
                  }}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus={true}
                  autoFocus={index === 0}
                />
              ))}
            </View>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={() => handleVerifyOtp()}
            >
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  body: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
  },
  emptyInput: {
    borderColor: '#e2e8f0',
  },
  filledInput: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  verifyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  verifyButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});
