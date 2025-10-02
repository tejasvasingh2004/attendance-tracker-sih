// AuthScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFormik } from 'formik';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeviceInfoUtils } from '../../core/device/deviceInfo';
import { useStudentAuth, useTeacherAuth, useOTP } from '../../hooks/useAuth';
import OTPModal from '../../components/modals/OTPModal';

type AuthScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

type AuthMode = 'login' | 'signup';
type UserRole = 'student' | 'teacher';

const RoleSelector = ({
  userRole,
  setUserRole,
}: {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}) => (
  <View style={styles.roleSelector}>
    <View style={styles.roleToggle}>
      <View
        style={[
          styles.roleToggleActive,
          { left: userRole === 'student' ? 4 : '50%' },
        ]}
      />
      <TouchableOpacity
        style={[styles.roleOption, userRole === 'student' && styles.roleOption]}
        onPress={() => setUserRole('student')}
      >
        <Icon
          name="school"
          size={20}
          color={userRole === 'student' ? '#ffffff' : '#64748b'}
        />
        <Text
          style={[
            styles.roleText,
            userRole === 'student' && styles.roleTextActive,
          ]}
        >
          Student
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.roleOption, userRole === 'teacher' && styles.roleOption]}
        onPress={() => setUserRole('teacher')}
      >
        <Icon
          name="person"
          size={20}
          color={userRole === 'teacher' ? '#ffffff' : '#64748b'}
        />
        <Text
          style={[
            styles.roleText,
            userRole === 'teacher' && styles.roleTextActive,
          ]}
        >
          Teacher
        </Text>
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
  const [otpEmail, setOtpEmail] = useState('');
  const [pendingSignupData, setPendingSignupData] = useState<any>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const { login: studentLogin, checkStudent, signup: studentSignup, loading: studentLoading } = useStudentAuth();
  const { login: teacherLogin, signup: teacherSignup, checkTeacher, loading: teacherLoading } = useTeacherAuth();
  const { generateOTP } = useOTP();
  
  const loading = studentLoading || teacherLoading;
  const isSignup = authMode === 'signup';

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfoUtils.getDeviceId();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    formik.resetForm();
  };

  const getInitialValues = () => ({ 
    name: '', 
    enrollment: '', 
    email: '',
    employeeId: '',
    department: ''
  });

  const formik = useFormik({
    initialValues: getInitialValues(),
    onSubmit: async values => {
      if (userRole === 'teacher') {
        if (!values.employeeId) {
          Alert.alert('Error', 'Please enter employee ID');
          return;
        }
      } else {
        if (!values.enrollment) {
          Alert.alert('Error', 'Please enter enrollment ID');
          return;
        }
        if (!deviceId) {
          Alert.alert('Error', 'Device ID not ready');
          return;
        }
      }

      try {
        // Helper function for role-based navigation
        const navigateBasedOnRole = (userRole: string) => {
          if (userRole === 'TEACHER') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'TeacherHome' }],
            });
          } else if (userRole === 'STUDENT') {
            // For now, navigate to TeacherHome until student screens are implemented
            navigation.reset({
              index: 0,
              routes: [{ name: 'TeacherHome' }],
            });
          } else {
            console.warn('Unknown user role:', userRole);
            navigation.reset({
              index: 0,
              routes: [{ name: 'TeacherHome' }],
            });
          }
        };

        if (authMode === 'login') {
          if (userRole === 'teacher') {
            const result = await teacherLogin(values.employeeId);
            if (result) {
              // Navigate based on the actual user role from the response
              navigateBasedOnRole(result.user.role);
            }
          } else {
            const result = await studentLogin(values.enrollment, deviceId);
            if (result) {
              // Navigate based on the actual user role from the response
              navigateBasedOnRole(result.user.role);
            }
          }
        } else {
          // For signup
          if (userRole === 'teacher') {
            // Check if teacher exists first
            const checkResult = await checkTeacher({
              employeeId: values.employeeId,
            });
            if (checkResult.exists) {
              Alert.alert('Info', 'Teacher already exists. Please login.');
              return;
            }

            // Generate OTP for teacher signup
            await generateOTP(values.email);

            // Prepare teacher data and open OTP modal
            setPendingSignupData({
              name: values.name || '',
              email: values.email,
              employeeId: values.employeeId,
              department: values.department || '',
              role: 'teacher',
            });
            setOtpEmail(values.email);
            setOtpModalVisible(true);
          } else {
            // Student signup: check if user exists first
            const checkResult = await checkStudent({
              rollNumber: values.enrollment,
            });
            if (checkResult.exists) {
              Alert.alert('Info', 'User already exists. Please login.');
              return;
            }

                        // Generate OTP, then open modal
            await generateOTP(values.email);

            // Prepare student data and open OTP modal
            setPendingSignupData({
              name: values.name || '',
              email: values.email,
              rollNumber: values.enrollment,
              year: 2025,
              section: 'A',
              hardwareId: deviceId,
              role: 'student',
            });
            setOtpEmail(values.email);
            setOtpModalVisible(true);
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="school" size={32} color="#3b82f6" />
          </View>
          <Text style={styles.title}>Attendance Tracker</Text>
          <Text style={styles.subtitle}>
            {authMode === 'login' ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        <RoleSelector userRole={userRole} setUserRole={handleRoleChange} />

        <View style={styles.form}>
          {isSignup && (
            <InputField
              icon="person"
              placeholder="Full Name"
              value={formik.values.name}
              onChangeText={(text: string) =>
                formik.setFieldValue('name', text)
              }
              onBlur={() => formik.handleBlur('name')}
              error={formik.touched.name && formik.errors.name}
            />
          )}

          {userRole === 'student' ? (
            <InputField
              icon="badge"
              placeholder="Enrollment ID"
              value={formik.values.enrollment}
              onChangeText={(text: string) =>
                formik.setFieldValue('enrollment', text)
              }
              onBlur={() => formik.handleBlur('enrollment')}
              error={formik.touched.enrollment && formik.errors.enrollment}
            />
          ) : (
            <InputField
              icon="work"
              placeholder="Employee ID"
              value={formik.values.employeeId}
              onChangeText={(text: string) =>
                formik.setFieldValue('employeeId', text)
              }
              onBlur={() => formik.handleBlur('employeeId')}
              error={formik.touched.employeeId && formik.errors.employeeId}
            />
          )}

          {isSignup && (
            <>
              <InputField
                icon="email"
                placeholder="Email Address"
                value={formik.values.email}
                onChangeText={(text: string) =>
                  formik.setFieldValue('email', text)
                }
                onBlur={() => formik.handleBlur('email')}
                error={formik.touched.email && formik.errors.email}
                keyboardType="email-address"
              />
              
              {userRole === 'teacher' && (
                <InputField
                  icon="business"
                  placeholder="Department"
                  value={formik.values.department}
                  onChangeText={(text: string) =>
                    formik.setFieldValue('department', text)
                  }
                  onBlur={() => formik.handleBlur('department')}
                  error={formik.touched.department && formik.errors.department}
                />
              )}
            </>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={() => formik.handleSubmit()}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading
                ? isSignup
                  ? 'Creating account...'
                  : 'Signing in...'
                : isSignup
                ? 'Create Account'
                : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.modeToggle}
            onPress={() => {
              setAuthMode(isSignup ? 'login' : 'signup');
              formik.resetForm();
            }}
          >
            <Text style={styles.modeToggleText}>
              {isSignup
                ? 'Already have an account? '
                : "Don't have an account? "}
              <Text style={styles.modeToggleLink}>
                {isSignup ? 'Sign In' : 'Sign Up'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* OTP Modal */}
      <OTPModal
        visible={isOtpModalVisible}
        email={otpEmail}
        onClose={() => setOtpModalVisible(false)}
        onResend={() => generateOTP(otpEmail)}
        onSuccess={async (otp: string) => {
          try {
            if (pendingSignupData) {
              let signupResult;
              
              if (pendingSignupData.role === 'teacher') {
                // Teacher signup with OTP
                signupResult = await teacherSignup({
                  name: pendingSignupData.name,
                  email: pendingSignupData.email,
                  employeeId: pendingSignupData.employeeId,
                  department: pendingSignupData.department,
                  otp: otp,
                });
              } else {
                // Student signup with OTP
                signupResult = await studentSignup({
                  ...pendingSignupData,
                  otp: otp,
                });
              }
              
              if (signupResult) {
                Alert.alert(
                  'Success',
                  'Account created successfully! You are now logged in.',
                );
                
                // Navigate based on the user role from the response
                const navigateBasedOnRole = (userRole: string) => {
                  if (userRole === 'TEACHER') {
                    navigation.navigate('TeacherHome');
                  } else if (userRole === 'STUDENT') {
                    navigation.navigate('/student/home' as any);
                  } else {
                    console.warn('Unknown user role:', userRole);
                    navigation.navigate('TeacherHome'); // Fallback
                  }
                };
                
                navigateBasedOnRole(signupResult.user.role);
              }
            }
          } catch (error) {
            console.error('Signup error:', error);
          } finally {
            setOtpModalVisible(false);
            setPendingSignupData(null);
            setOtpEmail('');
          }
        }}
      />
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center' },
  roleSelector: { marginBottom: 32 },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  roleToggleActive: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '50%',
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 1,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  roleTextActive: { color: '#ffffff' },
  form: { marginBottom: 32 },
  inputWrapper: { marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: { borderColor: '#ef4444' },
  inputIcon: { marginRight: 12, color: '#64748b' },
  input: { flex: 1, fontSize: 16, color: '#0f172a' },
  errorText: { color: '#ef4444', fontSize: 14, marginTop: 8, marginLeft: 4 },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center' },
  modeToggle: { paddingVertical: 12 },
  modeToggleText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  modeToggleLink: { color: '#3b82f6', fontWeight: '600' },
});
