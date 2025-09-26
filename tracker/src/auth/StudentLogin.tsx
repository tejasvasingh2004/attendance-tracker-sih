import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DeviceInfo from 'react-native-device-info';

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
        initialValues: { input: '', password: '' },
        validationSchema: Yup.object({
            input: Yup.string()
                .test(
                    'enroll-or-email',
                    'Enter valid 12-char Enrollment or Email',
                    value =>
                        /^[A-Za-z0-9]{12}$/.test(value || '') ||
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '')
                )
                .required('Required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: values => {
            console.log('Logging in with:', values);
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Login</Text>

            {/* Enrollment / Email */}
            <View style={styles.inputContainer}>
                <Icon name="person" size={24} style={styles.icon} />
                <TextInput
                    placeholder="Enrollment or Email"
                    style={styles.input}
                    value={formik.values.input}
                    onChangeText={formik.handleChange('input')}
                    onBlur={formik.handleBlur('input')}
                />
            </View>
            {formik.touched.input && formik.errors.input && (
                <Text style={styles.errorText}>{formik.errors.input}</Text>
            )}

            {/* Password */}
            <View style={styles.inputContainer}>
                <Icon name="lock" size={24} style={styles.icon} />
                <TextInput
                    placeholder="Password"
                    style={styles.input}
                    secureTextEntry
                    value={formik.values.password}
                    onChangeText={formik.handleChange('password')}
                    onBlur={formik.handleBlur('password')}
                />
            </View>
            {formik.touched.password && formik.errors.password && (
                <Text style={styles.errorText}>{formik.errors.password}</Text>
            )}
            <TouchableOpacity>
                <Text style={styles.forgotPassword}>{deviceId}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

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
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 50,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        color: '#000',
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
        fontWeight: 'bold',
    },
    optionRow: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'center',
    },
    optionText: {
        color: '#000',
        fontSize: 16,
        marginRight: 5,
    },
    optionLink: {
        color: '#1E90FF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
});
