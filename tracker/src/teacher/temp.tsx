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
  const [permissions, setPermissions] = useState<{ble: boolean, location: boolean}>({ble: false, location: false});
  const [bleLibraryStatus, setBleLibraryStatus] = useState<{available: boolean, error?: string}>({available: false});

  useEffect(() => {
    const checkStatus = async () => {
      const permStatus = await BLE.checkPermissions();
      setPermissions(permStatus);
      
      const libStatus = await BLE.checkBLELibrary();
      setBleLibraryStatus(libStatus);
    };
    checkStatus();

    return () => {
      if (advertisingRef.current) {
        BLE.stopAdvertising().catch(() => {});
      }
      if (scanningRef.current) {
        BLE.stopScan();
      }
    };
  }, []);

  const onRequestPermissions = useCallback(async () => {
    try {
      setScanMessages(prev => [...prev, '🔐 Requesting permissions...']);
      
      // Request all permissions
      const newPermissions = await BLE.requestPermissions();
      setPermissions(newPermissions);
      
      if (newPermissions.ble && newPermissions.location) {
        setScanMessages(prev => [...prev, '✅ All permissions granted']);
      } else {
        setScanMessages(prev => [...prev, `❌ Some permissions denied - BLE: ${newPermissions.ble}, Location: ${newPermissions.location}`]);
      }
      
    } catch (error) {
      console.error('Permission request error:', error);
      setScanMessages(prev => [...prev, `❌ Permission request failed: ${error}`]);
    }
  }, []);

  const onCheckLibrary = useCallback(async () => {
    try {
      setScanMessages(prev => [...prev, '🔍 Checking BLE library...']);
      
      const libStatus = await BLE.checkBLELibrary();
      setBleLibraryStatus(libStatus);
      
      if (libStatus.available) {
        setScanMessages(prev => [...prev, '✅ BLE library is working properly']);
      } else {
        setScanMessages(prev => [...prev, `❌ BLE library error: ${libStatus.error}`]);
      }
    } catch (error) {
      console.error('Library check error:', error);
      setScanMessages(prev => [...prev, `❌ Library check failed: ${error}`]);
    }
  }, []);

  const onStart = useCallback(async () => {
    try {
      // Check if BLE is supported
      if (!BLE.isSupported()) {
        Alert.alert('Error', 'BLE advertising is not supported on this device');
        return;
      }

      // Initialize BLE first
      const initialized = await BLE.initializeBLE();
      if (!initialized) {
        Alert.alert('Error', 'Failed to initialize BLE. Please check Bluetooth is enabled.');
        return;
      }

      await BLE.startAdvertising({ id: 123 }); // test payload
      advertisingRef.current = true;
      
      // Update permission status after successful advertising
      const permStatus = await BLE.checkPermissions();
      setPermissions(permStatus);
      
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

  const onStartScan = useCallback(async () => {
    try {
      // Check if BLE is supported
      if (!BLE.isSupported()) {
        Alert.alert('Error', 'BLE scanning is not supported on this device');
        return;
      }

      // Initialize BLE first
      const initialized = await BLE.initializeBLE();
      if (!initialized) {
        Alert.alert('Error', 'Failed to initialize BLE. Please check Bluetooth is enabled.');
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
          const payloadInfo = deviceData.decodedPayload 
            ? ` (ID: ${deviceData.decodedPayload.id}${deviceData.decodedPayload.name ? `, Name: ${deviceData.decodedPayload.name}` : ''})`
            : '';
          setScanMessages(prev => [
            ...prev,
            `✅ Found student device: ${deviceData.id}${payloadInfo}`,
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
        30000, // 10 second scan
      );

      scanningRef.current = true;
      setScanMessages(prev => [...prev, '🔍 Scanning for 30 seconds...']);
      
      // Update permission status after successful scan start
      const permStatus = await BLE.checkPermissions();
      setPermissions(permStatus);
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

  const onTestBasicAdvertising = useCallback(async () => {
    try {
      setScanMessages(prev => [...prev, '🧪 Testing basic advertising with manufacturer data...']);
      
      await BLE.testBasicAdvertising();
      
      setScanMessages(prev => [...prev, '✅ Basic advertising test completed successfully']);
      Alert.alert(
        'Test Complete', 
        'Basic advertising test completed!\n\nPayload: ID=123, Name="sahil"\n\nThis test broadcasts the payload using manufacturer data for 1 second.'
      );
    } catch (err) {
      console.error('Test basic advertising error:', err);
      setScanMessages(prev => [...prev, `❌ Basic advertising test failed: ${err}`]);
      Alert.alert('Test Failed', 'Basic advertising test failed. Check console for details.');
    }
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        <Text style={styles.title}>BLE Testing</Text>

      {/* BLE Library Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BLE Library Status</Text>
        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>BLE Library:</Text>
          <Text style={[styles.permissionStatus, bleLibraryStatus.available ? styles.granted : styles.denied]}>
            {bleLibraryStatus.available ? '✅ Available' : '❌ Not Available'}
          </Text>
        </View>
        {bleLibraryStatus.error && (
          <Text style={styles.errorText}>Error: {bleLibraryStatus.error}</Text>
        )}
        <TouchableOpacity 
          style={[styles.button, styles.libraryButton]} 
          onPress={onCheckLibrary}
        >
          <Text style={styles.buttonText}>Check BLE Library</Text>
        </TouchableOpacity>
      </View>

      {/* Permission Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permission Status</Text>
        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Bluetooth:</Text>
          <Text style={[styles.permissionStatus, permissions.ble ? styles.granted : styles.denied]}>
            {permissions.ble ? '✅ Granted' : '❌ Denied'}
          </Text>
        </View>
        <View style={styles.permissionRow}>
          <Text style={styles.permissionLabel}>Location:</Text>
          <Text style={[styles.permissionStatus, permissions.location ? styles.granted : styles.denied]}>
            {permissions.location ? '✅ Granted' : '❌ Denied'}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.button, styles.permissionButton]} 
          onPress={onRequestPermissions}
        >
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>
      </View>

      {/* Advertising Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advertising</Text>
        <TouchableOpacity style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>Start Advertise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.stop]} onPress={onStop}>
          <Text style={styles.buttonText}>Stop Advertise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.testButton]} onPress={onTestBasicAdvertising}>
          <Text style={styles.buttonText}>Test Basic Advertising (ID: 123, Name: sahil)</Text>
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
                <Text style={styles.deviceText}>Device ID: {device.id}</Text>
                {device.name && (
                  <Text style={styles.deviceText}>Device Name: {device.name}</Text>
                )}
                {device.decodedPayload && (
                  <View style={styles.payloadContainer}>
                    <Text style={styles.payloadTitle}>📡 Broadcasted Data:</Text>
                    <Text style={styles.payloadText}>ID: {device.decodedPayload.id}</Text>
                    {device.decodedPayload.name && (
                      <Text style={styles.payloadText}>Name: {device.decodedPayload.name}</Text>
                    )}
                  </View>
                )}
                {device.rssi && (
                  <Text style={styles.rssiText}>Signal: {device.rssi} dBm</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#d64545',
    marginBottom: 10,
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
  permissionButton: { backgroundColor: '#ff9500' },
  libraryButton: { backgroundColor: '#9c27b0' },
  testButton: { backgroundColor: '#17a2b8' },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    maxHeight: 250,
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
    maxHeight: 300,
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
  payloadContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#137fec',
  },
  payloadTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#137fec',
    marginBottom: 4,
  },
  payloadText: {
    fontSize: 13,
    color: '#137fec',
    fontWeight: '500',
  },
  rssiText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  permissionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  permissionStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  granted: {
    color: '#28a745',
  },
  denied: {
    color: '#d64545',
  },
});
