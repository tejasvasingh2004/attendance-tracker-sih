// set timout 
// 
// TempAdvertiser.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import BLE from '../lib/ble-manager';

export default function Temp() {
  const advertisingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (advertisingRef.current) {
        BLE.stopAdvertising().catch(() => {});
      }
    };
  }, []);

  const onStart = useCallback(async () => {
    try {
      // Check if BLE is supported
      if (!BLE.isSupported()) {
        Alert.alert('Error', 'BLE advertising is not supported on this device');
        return;
      }

      await BLE.startAdvertising({ id: 123 }); // test payload
      advertisingRef.current = true;
      Alert.alert('Advertising', 'Started advertising payload [123]');
    } catch (err) {
      console.error('Advertise error:', err);
      
      let errorMessage = 'Failed to start advertising';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      Alert.alert('Advertise Failed', errorMessage);
    }
  }, []);

  const onStop = useCallback(async () => {
    try {
      await BLE.stopAdvertising();
      advertisingRef.current = false;
      Alert.alert('Advertising', 'Stopped');
    } catch (err) {
      console.error('Stop error:', err);
      Alert.alert('Error', 'Failed to stop advertising');
    }
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Start Advertise</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.stop]} onPress={onStop}>
        <Text style={styles.buttonText}>Stop Advertise</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  button: { padding: 10, margin: 10, backgroundColor: '#137fec', borderRadius: 5 },
  stop: { backgroundColor: '#d64545' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
