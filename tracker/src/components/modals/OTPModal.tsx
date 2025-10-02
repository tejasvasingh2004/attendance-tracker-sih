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
  email: string;
  onClose: () => void;
  onSuccess: (otp: string) => void;
  onResend?: () => void;
}

export default ({ visible, email, onClose, onSuccess, onResend }: OTPModalProps) => {
  const [otp, setOtp] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  const handleVerifyOtp = (code?: string) => {
    const otpToVerify = code || otp;
    console.log('Verifying OTP:', otpToVerify);
    if (otpToVerify.length === 6) {
      onSuccess(otpToVerify);
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

  const handleResend = () => {
    if (onResend) {
      onResend();
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
              Please enter the 6-digit OTP sent to {email}
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
            <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>
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
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    width: 40,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  emptyInput: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  filledInput: {
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
  },
  resendButton: {
    alignSelf: 'center',
    padding: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
