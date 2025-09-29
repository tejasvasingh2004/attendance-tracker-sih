// AuthScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceInfoUtils } from '../../core/device/deviceInfo';
import { useStudentAuth} from '../../hooks/useAuth';
import OTPScreen from './OTP';

type AuthScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type AuthMode = 'login' | 'signup';
type UserRole = 'student' | 'teacher';

const RoleSelector = ({ userRole, setUserRole }: { userRole: UserRole; setUserRole: (role: UserRole) => void }) => (
  <View style={styles.roleSelector}>
    <View style={styles.roleToggle}>
      <View style={[styles.roleToggleActive, { left: userRole === 'student' ? 4 : '50%' }]} />
      <TouchableOpacity style={[styles.roleOption, userRole === 'student' && styles.roleOption]} onPress={() => setUserRole('student')}>
        <Icon name="school" size={20} color={userRole === 'student' ? '#ffffff' : '#64748b'} />
        <Text style={[styles.roleText, userRole === 'student' && styles.roleTextActive]}>Student</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.roleOption, userRole === 'teacher' && styles.roleOption]} onPress={() => setUserRole('teacher')}>
        <Icon name="person" size={20} color={userRole === 'teacher' ? '#ffffff' : '#64748b'} />
        <Text style={[styles.roleText, userRole === 'teacher' && styles.roleTextActive]}>Teacher</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
}: any) => (
  <View style={styles.inputWrapper}>
    <View style={[styles.inputContainer, error && styles.inputError]}>
      <Icon name={icon} size={20} style={styles.inputIcon} />
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#94a3b8"
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const AuthScreen = ({ navigation }: AuthScreenProps) => {
  const [deviceId, setDeviceId] = useState('');
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [otpUserId, setOtpUserId] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const { login, signup, loading } = useStudentAuth();

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfoUtils.getDeviceId();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  const getValidationSchema = () => {
    if (authMode === 'signup') {
      return Yup.object({
        name: Yup.string().required('Name is required'),
        enrollment: Yup.string()
          .matches(/^[A-Za-z0-9]{12}$/, 'Enrollment must be 12 characters')
          .required('Enrollment is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
      });
    }
    return Yup.object({
      enrollment: Yup.string()
        .matches(/^[A-Za-z0-9]{12}$/, 'Enrollment must be 12 characters')
        .required('Enrollment is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
    });
  };

  const getInitialValues = () => {
    if (authMode === 'signup') {
      return { name: '', enrollment: '', email: '' };
    }
    return { enrollment: '', email: '' };
  };

  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: getValidationSchema(),
    onSubmit: async values => {
      if (userRole === 'teacher') {
        Alert.alert('Coming Soon', 'Teacher authentication will be available soon!');
        return;
      }

      if (!values.email) {
        Alert.alert('Error', 'Please enter email');
        return;
      }
      if (!deviceId) {
        Alert.alert('Error', 'Device ID not ready');
        return;
      }

      try {
        if (authMode === 'login') {
          const result = await login(values.email, deviceId);
          if (result) {
            navigation.navigate('TeacherHome'); 
          }
        } else {
          const result = await signup({
            email: values.email,
            name: values.name || '',
            rollNumber: values.enrollment,
            year: 2025,
            section: "A",
            hardwareId: deviceId,
          });

          if (result) {
            setOtpUserId(result.user.id);
            setOtpEmail(values.email);
            setOtpModalVisible(true);
            setAuthMode('login');
            // Alert.alert('Success', 'Account created successfully! Please verify OTP.');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="school" size={32} color="#3b82f6" />
          </View>
          <Text style={styles.title}>Attendance Tracker</Text>
          <Text style={styles.subtitle}>
            {authMode === 'login' ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        <RoleSelector userRole={userRole} setUserRole={setUserRole} />

        <View style={styles.form}>
          {authMode === 'signup' && (
            <InputField
              icon="person"
              placeholder="Full Name"
              value={formik.values.name}
              onChangeText={(text: string) => formik.setFieldValue('name', text)}
              onBlur={() => formik.handleBlur('name')}
              error={formik.touched.name && formik.errors.name}
            />
          )}

          <InputField
            icon="badge"
            placeholder="Enrollment (12 characters)"
            value={formik.values.enrollment}
            onChangeText={(text: string) => formik.setFieldValue('enrollment', text)}
            onBlur={() => formik.handleBlur('enrollment')}
            error={formik.touched.enrollment && formik.errors.enrollment}
          />

          <InputField
            icon="email"
            placeholder="Email Address"
            value={formik.values.email}
            onChangeText={(text: string) => formik.setFieldValue('email', text)}
            onBlur={() => formik.handleBlur('email')}
            error={formik.touched.email && formik.errors.email}
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={() => formik.handleSubmit()}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? authMode === 'login' ? 'Signing in...' : 'Creating account...'
                : authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.modeToggle}
            onPress={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              formik.resetForm();
            }}
          >
            <Text style={styles.modeToggleText}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <Text style={styles.modeToggleLink}>
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* OTP Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOtpModalVisible}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContainer}>
            <OTPScreen
              route={{ params: { userId: otpUserId, email: otpEmail } }}
              navigation={{
                goBack: () => setOtpModalVisible(false),
                navigate: () => setOtpModalVisible(false), // close modal on OTP success
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  roleSelector: { marginBottom: 32 },
  roleToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, position: 'relative' },
  roleToggleActive: { position: 'absolute', top: 4, left: 4, width: '50%', height: 40, backgroundColor: '#3b82f6', borderRadius: 8, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  roleOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, zIndex: 1 },
  roleText: { fontSize: 14, fontWeight: '600', color: '#64748b', marginLeft: 8 },
  roleTextActive: { color: '#ffffff' },
  form: { marginBottom: 32 },
  inputWrapper: { marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginRight: 12, color: '#64748b' },
  input: { flex: 1, fontSize: 16, color: '#0f172a' },
  errorText: { color: '#ef4444', fontSize: 14, marginTop: 8, marginLeft: 4 },
  submitButton: { backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitButtonDisabled: { backgroundColor: '#94a3b8', shadowOpacity: 0, elevation: 0 },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center' },
  modeToggle: { paddingVertical: 12 },
  modeToggleText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  modeToggleLink: { color: '#3b82f6', fontWeight: '600' },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '60%', 
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
