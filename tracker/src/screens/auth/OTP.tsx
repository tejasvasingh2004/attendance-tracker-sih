import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import OTPInput from 'react-native-otp-inputs';
import { useOTP } from '../../hooks/useAuth';

const OTPScreen = ({ route, navigation }: any) => {
  const { userId, email } = route.params;
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
        // Navigate to appropriate screen after successful verification
        navigation.navigate('StudentDashboard'); // Update with actual screen name
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
    }
  }, [userId, otp, verifyOTP, navigation]);

  const handleResendOTP = useCallback(async () => {
    try {
      await resendOTP(userId);
    } catch (error) {
      console.error('Resend OTP Error:', error);
    }
  }, [userId, resendOTP]);

  return (
    <View style={styles.container}>
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
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  email: {
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  otpContainer: {
    marginBottom: 40,
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
    marginBottom: 30,
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
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
