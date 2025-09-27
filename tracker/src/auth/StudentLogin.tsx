import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';

type StudentLoginProps = {
    navigation: NativeStackNavigationProp<any>;
};

const StudentLogin = ({ navigation }: StudentLoginProps) => {
    const [deviceId, setDeviceId] = useState('');

    useEffect(() => {
        const fetchDeviceId = async () => {
            const id = await DeviceInfo.getUniqueId();
            setDeviceId(id);
        };
        fetchDeviceId();
    }, []);

    const formik = useFormik({
        initialValues: { enrollment: '', email: '' },
        validationSchema: Yup.object({
            enrollment: Yup.string()
                .matches(/^[A-Za-z0-9]{12}$/, 'Enrollment must be 12 characters')
                .required('Enrollment is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
        }),
        onSubmit: async values => {
            console.log("Sending email:", values.email);

            if (!values.email) {
                Alert.alert('Error', 'Please enter email');
                return;
            }
            if (!deviceId) {
                Alert.alert('Error', 'Device ID not ready');
                return;
            }

            try {
                const res = await axios.post('http://10.0.2.2:3000/api/students/login',
                    {
                        email: values.email,
                        hardwareId: deviceId
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                console.log("Response:", res.data);
                Alert.alert("Success", `Welcome ${res.data.user.name}`);
                const userId = res.data.user.id;
                const email = res.data.user.email;
                navigation.navigate('OTP', {userId, email})
            } catch (error: any) {
                console.error("Login error:", error.response?.data || error.message);
                Alert.alert("Error", error.response?.data?.error || "Something went wrong");
            }
        }

    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Login</Text>

            {/* Enrollment */}
            <View style={styles.inputContainer}>
                <Icon name="badge" size={24} style={styles.icon} />
                <TextInput
                    placeholder="Enrollment (12 chars)"
                    style={styles.input}
                    value={formik.values.enrollment}
                    onChangeText={text => formik.setFieldValue('enrollment', text)}
                    onBlur={() => formik.handleBlur('enrollment')}
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
                    onChangeText={text => formik.setFieldValue('email', text)}
                    onBlur={() => formik.handleBlur('email')}
                    keyboardType="email-address"
                />
            </View>
            {formik.touched.email && formik.errors.email && (
                <Text style={styles.errorText}>{formik.errors.email}</Text>
            )}

            {/* Login Button */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => formik.handleSubmit()}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/* Teacher Login */}
            <View style={styles.optionRow}>
                <Text style={styles.optionText}>Want to Login as a Teacher?</Text>
                <Text
                    style={styles.optionLink}
                    onPress={() => navigation.navigate('TeacherLogin')}
                >
                    Teacher Login
                </Text>
            </View>

            {/* Create Account */}
            <View style={styles.optionRow}>
                <Text style={styles.optionText}>Don't have an account?</Text>
                <Text
                    style={styles.optionLink}
                    onPress={() => navigation.navigate('StudentSignup')}
                >
                    Create Account
                </Text>
            </View>
        </View>
    );
};

export default StudentLogin;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, color: '#000' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 50, backgroundColor: '#f1f1f1', borderRadius: 8, paddingHorizontal: 10, marginBottom: 15 },
    icon: { marginRight: 10 },
    input: { flex: 1, height: '100%' },
    button: { width: '100%', height: 50, backgroundColor: '#1E90FF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    optionRow: { flexDirection: 'row', marginTop: 10 },
    optionText: { color: '#000', marginRight: 5 },
    optionLink: { color: '#1E90FF', fontWeight: 'bold' },
    errorText: { color: 'red', alignSelf: 'flex-start', marginBottom: 10 },
});
