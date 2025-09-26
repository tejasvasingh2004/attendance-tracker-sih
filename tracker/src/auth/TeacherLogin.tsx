import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TeacherLogin = ({ navigation }: any) => {
  const formik = useFormik({
    initialValues: { email: '', employeeId: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      employeeId: Yup.string()
        .matches(/^[A-Za-z0-9]{8}$/, 'Employee ID must be 8 characters')
        .required('Employee ID is required'),
    }),
    onSubmit: values => {
      console.log('Logging in with:', values);
      // Call backend API to validate Email + Employee ID and send OTP via Resend
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Login</Text>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Icon name="email" size={24} style={styles.icon} />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
          onBlur={formik.handleBlur('email')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {formik.touched.email && formik.errors.email && (
        <Text style={styles.errorText}>{formik.errors.email}</Text>
      )}

      {/* Employee ID */}
      <View style={styles.inputContainer}>
        <Icon name="badge" size={24} style={styles.icon} />
        <TextInput
          placeholder="Employee ID"
          style={styles.input}
          value={formik.values.employeeId}
          onChangeText={formik.handleChange('employeeId')}
          onBlur={formik.handleBlur('employeeId')}
        />
      </View>
      {formik.touched.employeeId && formik.errors.employeeId && (
        <Text style={styles.errorText}>{formik.errors.employeeId}</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => formik.handleSubmit()}
      >
        <Text style={styles.buttonText}>Send OTP</Text>
      </TouchableOpacity>

      {/* Navigation to Student Login */}
      <Text style={styles.signUp}>
        Want to Login as a Student?{' '}
        <Text
          style={styles.signUpLink}
          onPress={() => navigation.navigate('StudentLogin')}
        >
          Student Login
        </Text>
      </Text>
    </View>
  );
};

export default TeacherLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 40,
    fontWeight: 'bold',
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  signUp: {
    color: '#000',
  },
  signUpLink: {
    color: '#1E90FF',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});
