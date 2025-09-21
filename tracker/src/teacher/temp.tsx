// set timout
//
// TempAdvertiser.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import BLE, { DeviceData } from '../lib/ble-manager';

export default function Temp() {
  const advertisingRef = useRef(false);
  const scanningRef = useRef(false);
  const [detectedDevices, setDetectedDevices] = useState<DeviceData[]>([]);
  const [scanMessages, setScanMessages] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (advertisingRef.current) {
        BLE.stopAdvertising().catch(() => {});
      }
      if (scanningRef.current) {
        BLE.stopScan();
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

  const onStartScan = useCallback(() => {
    try {
      // Check if BLE is supported
      if (!BLE.isSupported()) {
        Alert.alert('Error', 'BLE scanning is not supported on this device');
        return;
      }

      if (BLE.getScanningStatus()) {
        Alert.alert('Warning', 'Already scanning for devices');
        return;
      }

      // Clear previous results
      setDetectedDevices([]);
      setScanMessages(['Starting scan for student devices...']);

      BLE.scanForStudentAttendance(
        (deviceData: DeviceData) => {
          setDetectedDevices(prev => [...prev, deviceData]);
          setScanMessages(prev => [
            ...prev,
            `✅ Found student device: ${deviceData.id}`,
          ]);
        },
        (foundStudents: DeviceData[]) => {
          // Called when scan is complete
          scanningRef.current = false;
          setScanMessages(prev => [
            ...prev,
            `📊 Scan complete! Found ${foundStudents.length} devices total`,
          ]);
        },
        10000, // 10 second scan
      );

      scanningRef.current = true;
      setScanMessages(prev => [...prev, '🔍 Scanning for 10 seconds...']);
    } catch (err) {
      console.error('Scan error:', err);
      Alert.alert('Scan Failed', 'Failed to start scanning');
    }
  }, []);

  const onStopScan = useCallback(() => {
    try {
      BLE.stopScan();
      scanningRef.current = false;
      setScanMessages(prev => [...prev, '⏹️ Scan stopped manually']);
    } catch (err) {
      console.error('Stop scan error:', err);
      Alert.alert('Error', 'Failed to stop scanning');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Testing</Text>

      {/* Advertising Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advertising</Text>
        <TouchableOpacity style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>Start Advertise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.stop]} onPress={onStop}>
          <Text style={styles.buttonText}>Stop Advertise</Text>
        </TouchableOpacity>
      </View>

      {/* Scanning Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scanning</Text>
        <TouchableOpacity
          style={[styles.button, styles.scan]}
          onPress={onStartScan}
        >
          <Text style={styles.buttonText}>Start Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.stop]}
          onPress={onStopScan}
        >
          <Text style={styles.buttonText}>Stop Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Detection Messages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detection Log</Text>
        <ScrollView
          style={styles.logContainer}
          showsVerticalScrollIndicator={true}
        >
          {scanMessages.map((message, index) => (
            <Text key={index} style={styles.logText}>
              {message}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Detected Devices */}
      {detectedDevices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Detected Devices ({detectedDevices.length})
          </Text>
          <ScrollView
            style={styles.deviceContainer}
            showsVerticalScrollIndicator={true}
          >
            {detectedDevices.map((device, index) => (
              <View key={index} style={styles.deviceItem}>
                <Text style={styles.deviceText}>ID: {device.id}</Text>
                {device.name && (
                  <Text style={styles.deviceText}>Name: {device.name}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  button: {
    padding: 12,
    margin: 5,
    backgroundColor: '#137fec',
    borderRadius: 8,
    alignItems: 'center',
  },
  stop: { backgroundColor: '#d64545' },
  scan: { backgroundColor: '#28a745' },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  deviceContainer: {
    maxHeight: 120,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deviceItem: {
    padding: 8,
    marginBottom: 5,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  deviceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
