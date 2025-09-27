/**
 * OTP Verification Modal
 * Modal component for OTP verification during login
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import OTPInput from 'react-native-otp-inputs';
import { useOTP } from '../../hooks/useAuth';

interface OTPModalProps {
  visible: boolean;
  userId: string;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

const OTPModal: React.FC<OTPModalProps> = ({
  visible,
  userId,
  email,
  onClose,
  onSuccess,
}) => {
  const [otp, setOtp] = useState('');
  const { verifyOTP, resendOTP, loading } = useOTP();

  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const result = await verifyOTP(userId, otp);
      if (result) {
        setOtp(''); // Clear OTP on success
        onSuccess();
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
    }
  }, [userId, otp, verifyOTP, onSuccess]);

  const handleResendOTP = useCallback(async () => {
    try {
      await resendOTP(userId);
    } catch (error) {
      console.error('Resend OTP Error:', error);
    }
  }, [userId, resendOTP]);

  const handleClose = useCallback(() => {
    setOtp(''); // Clear OTP when closing
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <View style={styles.otpContainer}>
            <OTPInput
              value={otp}
              handleChange={setOtp}
              numberOfInputs={6}
              autofillFromClipboard={false}
              style={styles.otpInput}
              inputStyles={styles.otpInputStyle}
              focusStyles={styles.otpFocusStyle}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={loading}
            >
              <Text style={[styles.resendLink, loading && styles.resendLinkDisabled]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default OTPModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  email: {
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  otpContainer: {
    marginBottom: 32,
  },
  otpInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpInputStyle: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  otpFocusStyle: {
    borderColor: '#1E90FF',
    backgroundColor: '#f0f8ff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#666',
    marginRight: 5,
  },
  resendLink: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
  resendLinkDisabled: {
    color: '#ccc',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
