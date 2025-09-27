import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import OTPInput from 'react-native-otp-inputs';
import axios from 'axios';

const { height } = Dimensions.get('window');

const OTPScreen = ({ route, navigation }: any) => {
    const { userId, email } = route.params;
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    console.log(userId)

    // Generate OTP when screen opens 
    useEffect(() => {
        generateOTP();
    }, []);

    const generateOTP = async () => {
        try {
            setLoading(true);
            const res = await axios.post('http://10.0.2.2:3000/api/otp/generate', { userId, email });
            setLoading(false);
            Alert.alert('OTP Sent', 'A 6-digit OTP has been sent to your email.');
            console.log(res.data);
        } catch (error: any) {
            setLoading(false);
            console.error('Generate OTP Error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to send OTP. Try again.');
        }
    };

    const verifyOTP = async () => {
        if (otp.length !== 6) {
            return Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP.');
        }

        try {
            setLoading(true);
            const res = await axios.post('http://10.0.2.2:3000/api/otp/verify', { userId, otp });
            setLoading(false);

            console.log(res.data); 

            if (res.data.message == "OTP verified successfully") {
                Alert.alert('Success', res.data.message, [
                    { text: 'OK', onPress: () => navigation.navigate('Temp') }
                ]);
            } else {
                Alert.alert('Error', res.data.message || 'OTP verification failed.');
            }
        } catch (error: any) {
            setLoading(false);
            console.error('Verify OTP Error:', error.response?.data || error.message);
            Alert.alert('Error', 'OTP verification failed.');
        }
    };

    const resendOTP = async () => {
        try {
            setLoading(true);
            const res = await axios.post('http://10.0.2.2:3000/api/otp/resend', { userId });
            setLoading(false);
            Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
        } catch (error: any) {
            setLoading(false);
            console.error('Resend OTP Error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to resend OTP.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>
                Enter the 6-digit code sent to your registered email
            </Text>

            <OTPInput
                handleChange={setOtp}
                numberOfInputs={6}
                autofillFromClipboard={false}
                inputContainerStyles={styles.otpInputContainer}
                inputStyles={styles.otpInput}
            />

            <TouchableOpacity style={styles.button} onPress={verifyOTP} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Verify OTP'}</Text>
            </TouchableOpacity>

            <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive OTP? </Text>
                <TouchableOpacity onPress={resendOTP}>
                    <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OTPScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: height * 0.1,
        paddingBottom: height * 0.1,
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1E90FF',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 50,
    },
    otpInputContainer: {
        borderWidth: 1,
        borderColor: '#1E90FF',
        borderRadius: 8,
        margin: 5,
        width: 50,
        height: 50,
        justifyContent: 'center',
    },
    otpInput: {
        fontSize: 20,
        textAlign: 'center',
    },
    button: {
        marginTop: 40,
        backgroundColor: '#1E90FF',
        paddingVertical: 15,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendRow: {
        flexDirection: 'row',
        marginTop: 30,
    },
    resendText: {
        color: '#555',
    },
    resendLink: {
        color: '#1E90FF',
        fontWeight: 'bold',
    },
});
