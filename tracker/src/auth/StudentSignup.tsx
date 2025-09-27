import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DeviceInfo from 'react-native-device-info';

type StudentSignupProps = {
  navigation: NativeStackNavigationProp<any>;
};

const StudentSignup = ({ navigation }: StudentSignupProps) => {
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  const formik = useFormik({
    initialValues: { name: '', enrollment: '', email: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      enrollment: Yup.string()
        .matches(/^[A-Za-z0-9]{12}$/, 'Enrollment must be 12 characters')
        .required('Enrollment is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async values => {
      try {
        const res = await axios.post("http://10.0.2.2:3000/api/students/signup", {
          email: values.email,
          name: values.name,
          rollNumber: values.enrollment,
          year: 2025,
          section: "A",
          hardwareId: deviceId
        });

        Alert.alert("Success", res.data.message);
        console.log("User created:", res.data.user);

        navigation.navigate('StudentLogin');
      } catch (error: any) {
        console.error("Signup error:", error.response?.data || error.message);
        Alert.alert("Error", error.response?.data?.error || "Something went wrong");
      }
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Name */}
      <View style={styles.inputContainer}>
        <Icon name="person" size={24} style={styles.icon} />
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={formik.values.name}
          onChangeText={formik.handleChange('name')}
          onBlur={formik.handleBlur('name')}
        />
      </View>
      {formik.touched.name && formik.errors.name && (
        <Text style={styles.errorText}>{formik.errors.name}</Text>
      )}

      {/* Enrollment */}
      <View style={styles.inputContainer}>
        <Icon name="badge" size={24} style={styles.icon} />
        <TextInput
          placeholder="Enrollment (12 chars)"
          style={styles.input}
          value={formik.values.enrollment}
          onChangeText={formik.handleChange('enrollment')}
          onBlur={formik.handleBlur('enrollment')}
        />
      </View>
      {formik.touched.enrollment && formik.errors.enrollment && (
        <Text style={styles.errorText}>{formik.errors.enrollment}</Text>
      )}

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
        />
      </View>
      {formik.touched.email && formik.errors.email && (
        <Text style={styles.errorText}>{formik.errors.email}</Text>
      )}

      {/* Signup Button */}
      <TouchableOpacity style={styles.button} onPress={() => formik.handleSubmit()}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Navigate to Login */}
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <Text style={{ color: '#000', marginRight: 5 }}>Already have an account?</Text>
        <Text
          style={styles.signUpLink}
          onPress={() => navigation.navigate('StudentLogin')}
        >
          Login
        </Text>
      </View>
    </View>
  );
};

export default StudentSignup;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20 },
  title: { fontSize: 32, marginBottom: 40, fontWeight: 'bold', color: 'black' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 50, backgroundColor: '#f1f1f1', borderRadius: 8, paddingHorizontal: 10, marginBottom: 20 },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%' },
  button: { width: '100%', height: 50, backgroundColor: '#1E90FF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18 },
  signUpLink: { color: '#1E90FF' },
  errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 10 },
});
