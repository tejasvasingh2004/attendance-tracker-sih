import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import BLE, { type BLEPayload } from '../lib/ble-manager';

export default function Temp() {
  const advertisingRef = useRef(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<
    Record<string, { id: string; name: string | null; rssi: number | null; payload?: BLEPayload | null }>
  >({});

  useEffect(() => {
    return () => {
      if (advertisingRef.current) {
        BLE.stopAdvertising().catch(() => {});
      }
      if (BLE.isScanningActive()) {
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

      const payload = { id: 1, e: '0801EC241086' };

      await BLE.startAdvertising(payload, {
        txPowerLevel: 3,
        advertiseMode: 2,
        includeDeviceName: false,
        includeTxPowerLevel: false,
        connectable: false,
      });
      advertisingRef.current = true;

      setMessages(prev => [
        ...prev,
        `✅ Started advertising: ID=${payload.id}, E=${payload.e}`,
      ]);
      Alert.alert(
        'Advertising',
        `Started advertising payload [${payload.id}] - ${payload.e}`,
      );
    } catch (err) {
      console.error('Advertise error:', err);

      let errorMessage = 'Failed to start advertising';
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setMessages(prev => [...prev, `❌ Advertising failed: ${errorMessage}`]);
      Alert.alert('Advertise Failed', errorMessage);
    }
  }, []);

  const onStop = useCallback(async () => {
    try {
      await BLE.stopAdvertising();
      advertisingRef.current = false;
      setMessages(prev => [...prev, '⏹️ Advertising stopped']);
      Alert.alert('Advertising', 'Stopped');
    } catch (err) {
      console.error('Stop error:', err);
      setMessages(prev => [...prev, `❌ Failed to stop advertising: ${err}`]);
      Alert.alert('Error', 'Failed to stop advertising');
    }
  }, []);

  const onStartScan = useCallback(async () => {
    try {
      setDevices({});
      setIsScanning(true);
      setMessages(prev => [...prev, '🔎 Starting BLE scan (10s)...']);
      await BLE.startScan(
        device => {
          setDevices(prev => {
            const next = { ...prev };
            const payload = BLE.extractPayloadFromDevice(device);
            if (payload) {
              next[device.id] = {
                id: device.id,
                name: device.name ?? null,
                rssi: device.rssi ?? null,
                payload,
              };
            }
            return next;
          });
        },
        null,
        { legacyScan: true },
        10000,
      );
      setTimeout(() => setIsScanning(BLE.isScanningActive()), 11000);
    } catch (e) {
      setIsScanning(false);
      setMessages(prev => [
        ...prev,
        `❌ Scan start failed: ${e instanceof Error ? e.message : String(e)}`,
      ]);
      Alert.alert('Scan', 'Failed to start scan');
    }
  }, []);

  const onStopScan = useCallback(() => {
    try {
      BLE.stopScan();
      setIsScanning(false);
      setMessages(prev => [...prev, '⏹️ Scan stopped']);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        `❌ Failed to stop scan: ${e instanceof Error ? e.message : String(e)}`,
      ]);
    }
  }, []);

  const onClear = useCallback(() => {
    setMessages([]);
    setDevices({});
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        <Text style={styles.title}>BLE Advertiser</Text>

        {/* Advertising Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Student Attendance Broadcasting
          </Text>
          <Text style={styles.infoText}>Payload: ID=1, E="0801EC241086"</Text>

          <TouchableOpacity style={styles.button} onPress={onStart}>
            <Text style={styles.buttonText}>Start Broadcasting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.stop]}
            onPress={onStop}
          >
            <Text style={styles.buttonText}>Stop Broadcasting</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan Devices</Text>
          <Text style={styles.infoText}>
            {isScanning
              ? 'Scanning... (auto-stops after 10s)'
              : 'Press Start to begin scanning'}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={onStartScan}
            disabled={isScanning}
          >
            <Text style={styles.buttonText}>
              {isScanning ? 'Scanning…' : 'Start Scan (10s)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.stop]}
            onPress={onStopScan}
            disabled={!isScanning}
          >
            <Text style={styles.buttonText}>Stop Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button]} onPress={onClear}>
            <Text style={styles.buttonText}>Clear Logs & Devices</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Messages</Text>
          <ScrollView
            style={styles.logContainer}
            showsVerticalScrollIndicator={true}
          >
            {messages.map((message, index) => (
              <Text key={index} style={styles.logText}>
                {message}
              </Text>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Discovered Devices ({Object.keys(devices).length})
          </Text>
          <ScrollView
            style={styles.logContainer}
            showsVerticalScrollIndicator={true}
          >
            {Object.values(devices).map(d => {
              const payloadStr = d.payload ? ` | Payload → ID=${d.payload.id}${d.payload.e ? `, E=${d.payload.e}` : ''}` : '';
              return (
                <Text key={d.id} style={styles.logText}>
                  {`${d.name ?? 'Unknown'} (${d.id}) RSSI: ${d.rssi ?? 'N/A'}${payloadStr}`}
                </Text>
              );
            })}
          </ScrollView>
        </View>
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
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    padding: 12,
    margin: 5,
    backgroundColor: '#137fec',
    borderRadius: 8,
    alignItems: 'center',
  },
  stop: { backgroundColor: '#d64545' },
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
});
