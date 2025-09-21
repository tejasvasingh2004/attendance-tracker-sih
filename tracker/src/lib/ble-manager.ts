import { Platform } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { BleManager, State } from 'react-native-ble-plx';
import PermissionManager from './permission-manager';

// Constants
const SERVICE_UID = '0000feed-0000-1000-8000-00805f9b34fb';

// Types
export interface BLEPayload {
  id: number;
}

export interface BLEAdvertisingOptions {
  companyId?: number;
  serviceUid?: string;
}

export interface DeviceData {
  id: string;
  name?: string;
  decodedPayload?: BLEPayload;
  [key: string]: any;
}

export type OnStudentFoundCallback = (deviceData: DeviceData) => void;
export type OnScanCompleteCallback = (foundStudents: DeviceData[]) => void;

/*eslint-disable no-bitwise */
function makePayloadBytes(payload: BLEPayload): number[] {
  const { id } = payload;
  const unsignedId = id >>> 0; // Convert to unsigned 32-bit integer

  const buffer = new Uint8Array(4);
  buffer[0] = (unsignedId >> 24) & 0xff;
  buffer[1] = (unsignedId >> 16) & 0xff;
  buffer[2] = (unsignedId >> 8) & 0xff;
  buffer[3] = unsignedId & 0xff;

  return Array.from(buffer);
}
/*eslint-enable no-bitwise */

function validatePayload(payload: BLEPayload): void {
  if (typeof payload.id !== 'number' || !Number.isInteger(payload.id)) {
    throw new Error('Payload ID must be a valid integer');
  }

  if (payload.id < 0 || payload.id > 0xffffffff) {
    throw new Error('Payload ID must be between 0 and 4294967295');
  }
}

// BLE Class
export class BLE {
  private static instance: BLE;
  private isAdvertising: boolean = false;
  private isScanning: boolean = false;
  private currentPayload: BLEPayload | null = null;
  private currentScanStopFunction: (() => void) | null = null;
  private bleManager: BleManager;

  private constructor() {
    this.bleManager = new BleManager();
  }

  public static getInstance(): BLE {
    if (!BLE.instance) {
      BLE.instance = new BLE();
    }
    return BLE.instance;
  }

  public async startAdvertising(
    payload: BLEPayload,
    options: BLEAdvertisingOptions = {},
  ): Promise<void> {
    try {
      // Validate payload
      validatePayload(payload);

      // Check if already advertising
      if (this.isAdvertising) {
        throw new Error('Already advertising. Stop current advertising first.');
      }

      // Request permissions
      await PermissionManager.requestBLEPermissions();

      // Set company ID if provided and supported
      if (options.companyId && typeof BLEAdvertiser.setCompanyId === 'function') {
        BLEAdvertiser.setCompanyId(options.companyId);
        console.log(`BLE: Set company ID to ${options.companyId}`);
      }

      // Create payload bytes
      const payloadBytes = makePayloadBytes(payload);
      const serviceUid = options.serviceUid ?? SERVICE_UID;

      console.log('BLE: Advertising with:');
      console.log('  - Service UID:', serviceUid);
      console.log('  - Payload bytes:', payloadBytes);
      console.log('  - Payload bytes (hex):', payloadBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));

      // Start advertising with manufacturer data
      const result = await BLEAdvertiser.broadcast(serviceUid, payloadBytes, {
        includeDeviceName: false,
        includeTxPowerLevel: false,
        connectable: false,
      });

      console.log('BLE: Broadcast result:', result);

      // Update state
      this.isAdvertising = true;
      this.currentPayload = payload;

      console.log(`BLE: Started advertising payload [${payload.id}]`);
    } catch (error) {
      console.error('BLE: Failed to start advertising:', error);
      throw error;
    }
  }

  public async stopAdvertising(): Promise<void> {
    try {
      if (!this.isAdvertising) {
        console.warn('BLE: No active advertising to stop');
        return;
      }

      if (typeof BLEAdvertiser.stopBroadcast === 'function') {
        await BLEAdvertiser.stopBroadcast();
      }

      // Update state
      this.isAdvertising = false;
      const stoppedPayload = this.currentPayload;
      this.currentPayload = null;

      console.log(
        `BLE: Stopped advertising payload [${stoppedPayload?.id || 'unknown'}]`,
      );
    } catch (error) {
      console.error('BLE: Failed to stop advertising:', error);
      throw error;
    }
  }

  public getAdvertisingStatus(): {
    isAdvertising: boolean;
    payload: BLEPayload | null;
  } {
    return {
      isAdvertising: this.isAdvertising,
      payload: this.currentPayload,
    };
  }

  public async restartAdvertising(
    payload: BLEPayload,
    options: BLEAdvertisingOptions = {},
  ): Promise<void> {
    if (this.isAdvertising) {
      await this.stopAdvertising();
      // Small delay to ensure clean restart
      await new Promise<void>(resolve => setTimeout(resolve, 100));
    }
    await this.startAdvertising(payload, options);
  }

  public isSupported(): boolean {
    return Platform.OS === 'android' && 
           typeof BLEAdvertiser !== 'undefined' && 
           this.bleManager !== null;
  }

  /**
   * Initialize BLE manager and check state
   */
  public async initializeBLE(): Promise<boolean> {
    try {
      const state = await this.bleManager.state();
      console.log('BLE: Current state:', state);
      return state === State.PoweredOn;
    } catch (error) {
      console.error('BLE: Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Verify if a scanned device matches our advertising payload
   */
  private verifyDevicePayload(deviceData: DeviceData, expectedPayload: BLEPayload): boolean {
    try {
      // Check if device has our service UUID
      if (!deviceData.serviceUUIDs || !deviceData.serviceUUIDs.includes(SERVICE_UID)) {
        console.log('BLE: Device does not have our service UUID');
        return false;
      }

      // Check manufacturer data if available
      if (deviceData.manufacturerData) {
        console.log('BLE: Device manufacturer data:', deviceData.manufacturerData);
        
        // Convert manufacturer data to bytes for comparison
        const manufacturerBytes = this.hexStringToBytes(deviceData.manufacturerData);
        const expectedBytes = makePayloadBytes(expectedPayload);
        
        console.log('BLE: Manufacturer bytes:', manufacturerBytes);
        console.log('BLE: Expected payload bytes:', expectedBytes);
        
        // Compare the payload bytes
        if (this.arraysEqual(manufacturerBytes, expectedBytes)) {
          console.log('BLE: ✅ Device payload matches expected payload!');
          return true;
        } else {
          console.log('BLE: ❌ Device payload does not match expected payload');
          return false;
        }
      }

      // If no manufacturer data, we can't verify the payload
      console.log('BLE: No manufacturer data to verify payload');
      return false;
    } catch (error) {
      console.error('BLE: Error verifying device payload:', error);
      return false;
    }
  }

  /**
   * Convert hex string to byte array
   */
  private hexStringToBytes(hexString: string): number[] {
    console.log('Converting hex string:', hexString);
    const bytes: number[] = [];
    
    // Remove any non-hex characters and convert to uppercase
    const cleanHex = hexString.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    console.log('Cleaned hex string:', cleanHex);
    
    for (let i = 0; i < cleanHex.length; i += 2) {
      const hexPair = cleanHex.substr(i, 2);
      if (hexPair.length === 2) {
        const byte = parseInt(hexPair, 16);
        if (!isNaN(byte)) {
          bytes.push(byte);
          console.log(`Hex pair "${hexPair}" -> byte ${byte} (0x${byte.toString(16).padStart(2, '0')})`);
        }
      }
    }
    
    console.log('Final bytes array:', bytes);
    return bytes;
  }

  /**
   * Compare two byte arrays
   */
  private arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Scan for student BLE signals for attendance.
   * @param {OnStudentFoundCallback} onStudentFound - Called with each found student device
   * @param {OnScanCompleteCallback} onScanComplete - Called with all found students after scan
   * @param {number} scanDuration - Scan duration in ms (default 15000)
   */
  public async scanForStudentAttendance(
    onStudentFound: OnStudentFoundCallback,
    onScanComplete: OnScanCompleteCallback,
    scanDuration: number = 30 * 1000,
  ): Promise<() => void> {
    return this.tryRealBLEScanning(onStudentFound, onScanComplete, scanDuration);
  }

  /**
   * Stop current BLE scanning.
   */
  public stopScan(): void {
    if (!this.isScanning) {
      console.warn('BLE: No active scan to stop');
      return;
    }

    try {
      this.bleManager.stopDeviceScan();
      console.log('BLE: Stop Scan Successful');
    } catch (error) {
      console.log('BLE: Stop Scan Error', error);
    }

    this.isScanning = false;
    this.currentScanStopFunction = null;
  }

  /**
   * Get current scanning status.
   */
  public getScanningStatus(): boolean {
    return this.isScanning;
  }


  /**
   * Real BLE scanning method using react-native-ble-plx
   * Attempts to detect BLE devices broadcasting with our service UID
   */
  public async tryRealBLEScanning(
    onStudentFound: OnStudentFoundCallback,
    onScanComplete: OnScanCompleteCallback,
    scanDuration: number = 30 * 1000,
  ): Promise<() => void> {
    console.log('BLE: Starting real BLE scanning with react-native-ble-plx...');
    
    if (this.isScanning) {
      console.warn('BLE: Already scanning. Stop current scan first.');
      return () => {};
    }

    try {
      // Request permissions before scanning
      await PermissionManager.requestBLEPermissions();
      await PermissionManager.requestLocationPermissions();

      // Check if Bluetooth is enabled
      const state = await this.bleManager.state();
      if (state !== State.PoweredOn) {
        throw new Error(`Bluetooth is not enabled. Current state: ${state}`);
      }

      this.isScanning = true;
      const foundStudents: DeviceData[] = [];
      const seenIds = new Set<string>();

      // Start scanning with react-native-ble-plx
      this.bleManager.startDeviceScan(
        [SERVICE_UID], // Service UUIDs to scan for
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('BLE: Scan error:', error);
            return;
          }

          if (device) {
            console.log(`BLE: Found device [${device.id}] - Name: ${device.name || 'Unknown'}`);
            console.log('BLE: Device data:', {
              id: device.id,
              name: device.name,
              rssi: device.rssi,
              serviceUUIDs: device.serviceUUIDs,
              manufacturerData: device.manufacturerData,
              serviceData: device.serviceData,
            });

            // Convert to our DeviceData format
            const deviceData: DeviceData = {
              id: device.id,
              name: device.name || undefined,
              rssi: device.rssi,
              serviceUUIDs: device.serviceUUIDs,
              manufacturerData: device.manufacturerData,
              serviceData: device.serviceData,
            };

            // Automatically analyze the manufacturer data to decode the payload
            if (device.manufacturerData) {
              console.log('BLE: 🔍 Analyzing manufacturer data...');
              try {
                const bytes = this.hexStringToBytes(device.manufacturerData);
                console.log('BLE: Manufacturer data bytes:', bytes);
                console.log('BLE: Manufacturer data (hex):', bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
                
                // Try to decode as payload ID
                if (bytes.length >= 4) {
                  const payloadId = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
                  console.log(`BLE: 📦 Decoded Payload ID: ${payloadId}`);
                  console.log(`BLE: 📦 Decoded Payload ID (hex): 0x${payloadId.toString(16).toUpperCase()}`);
                  
                  // Add decoded payload to device data
                  deviceData.decodedPayload = { id: payloadId };
                } else {
                  console.log('BLE: ⚠️ Manufacturer data too short to decode as payload');
                }
              } catch (error) {
                console.error('BLE: Error analyzing manufacturer data:', error);
              }
            } else {
              console.log('BLE: ⚠️ No manufacturer data found');
            }

            // Check if we've seen this device before
            if (!seenIds.has(device.id)) {
              foundStudents.push(deviceData);
              seenIds.add(device.id);
              console.log(`BLE: ✅ New device found [${device.id}]`);
              if (onStudentFound) onStudentFound(deviceData);
            }
          }
        }
      );

      // Store stop function for cleanup
      const stopFunction = () => {
        clearTimeout(timer);
        this.bleManager.stopDeviceScan();
        this.isScanning = false;
        if (onScanComplete) onScanComplete(foundStudents);
      };

      // Stop scan after scanDuration ms
      const timer = setTimeout(() => {
        this.bleManager.stopDeviceScan();
        this.isScanning = false;
        if (onScanComplete) onScanComplete(foundStudents);
      }, scanDuration);

      return stopFunction;
    } catch (error) {
      console.error('BLE: Failed to start scanning:', error);
      this.isScanning = false;
      throw error;
    }
  }

  /**
   * Test advertising with detailed logging
   */
  public async testAdvertising(payload: BLEPayload, companyId?: number): Promise<void> {
    console.log('=== BLE Advertising Test ===');
    console.log('Payload:', payload);
    console.log('Service UID:', SERVICE_UID);
    if (companyId) {
      console.log('Company ID:', companyId);
    }
    
    try {
      await this.startAdvertising(payload, { companyId });
      console.log('✅ Advertising started successfully');
      
      // Log the payload bytes for debugging
      const payloadBytes = makePayloadBytes(payload);
      console.log('Payload bytes:', payloadBytes);
      console.log('Payload bytes (hex):', payloadBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
      
      // Log what should be in manufacturer data
      console.log('Expected manufacturer data (hex):', payloadBytes.map(b => b.toString(16).padStart(2, '0')).join(''));
      
    } catch (error) {
      console.error('❌ Advertising failed:', error);
    }
    console.log('=============================');
  }

  /**
   * Test advertising with different company IDs
   */
  public async testAdvertisingWithCompanyId(payload: BLEPayload): Promise<void> {
    console.log('=== BLE Advertising Test with Company ID ===');
    
    const companyIds = [0x004C, 0x0000, 0x0001, 0x0002]; // Apple, Generic, etc.
    
    for (const companyId of companyIds) {
      try {
        console.log(`\nTesting with Company ID: 0x${companyId.toString(16).toUpperCase()}`);
        await this.testAdvertising(payload, companyId);
        
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Stop current advertising
        await this.stopAdvertising();
        
      } catch (error) {
        console.error(`❌ Advertising failed with Company ID 0x${companyId.toString(16).toUpperCase()}:`, error);
      }
    }
    
    console.log('=============================================');
  }

  /**
   * Test basic advertising functionality
   */
  public async testBasicAdvertising(): Promise<void> {
    console.log('=== Basic BLE Advertising Test ===');
    
    try {
      // Test 1: Simple broadcast with minimal data
      console.log('Test 1: Simple broadcast with minimal data');
      const result1 = await BLEAdvertiser.broadcast(SERVICE_UID, [0x01, 0x02, 0x03, 0x04], {});
      console.log('✅ Simple broadcast result:', result1);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stop broadcast
      await BLEAdvertiser.stopBroadcast();
      console.log('✅ Stopped simple broadcast');
      
      // Test 2: Broadcast with our payload
      console.log('\nTest 2: Broadcast with our payload');
      const payload = { id: 12345 };
      const payloadBytes = makePayloadBytes(payload);
      console.log('Payload bytes to send:', payloadBytes);
      console.log('Payload bytes (hex):', payloadBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
      
      const result2 = await BLEAdvertiser.broadcast(SERVICE_UID, payloadBytes, {});
      console.log('✅ Payload broadcast result:', result2);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stop broadcast
      await BLEAdvertiser.stopBroadcast();
      console.log('✅ Stopped payload broadcast');
      
    } catch (error) {
      console.error('❌ Basic advertising test failed:', error);
    }
    
    console.log('==================================');
  }

  /**
   * Test advertising with different data formats
   */
  public async testAdvertisingFormats(): Promise<void> {
    console.log('=== BLE Advertising Format Tests ===');
    
    const testPayload = { id: 12345 };
    const payloadBytes = makePayloadBytes(testPayload);
    
    console.log('Test payload:', testPayload);
    console.log('Payload bytes:', payloadBytes);
    console.log('Payload bytes (hex):', payloadBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    const testCases = [
      {
        name: 'Original payload bytes',
        data: payloadBytes,
        description: '4-byte payload as-is'
      },
      {
        name: 'Padded payload (8 bytes)',
        data: [...payloadBytes, 0x00, 0x00, 0x00, 0x00],
        description: '4-byte payload + 4 padding bytes'
      },
      {
        name: 'Simple test data',
        data: [0x12, 0x34, 0x56, 0x78],
        description: 'Simple 4-byte test data'
      },
      {
        name: 'Single byte test',
        data: [0xAB],
        description: 'Single byte test'
      }
    ];
    
    for (const testCase of testCases) {
      try {
        console.log(`\n--- Testing: ${testCase.name} ---`);
        console.log(`Description: ${testCase.description}`);
        console.log('Data to send:', testCase.data);
        console.log('Data (hex):', testCase.data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        
        const result = await BLEAdvertiser.broadcast(SERVICE_UID, testCase.data, {});
        console.log('✅ Broadcast result:', result);
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Stop broadcast
        await BLEAdvertiser.stopBroadcast();
        console.log('✅ Stopped broadcast');
        
      } catch (error) {
        console.error(`❌ Test failed for ${testCase.name}:`, error);
      }
    }
    
    console.log('=====================================');
  }

  /**
   * Check what payload is currently being advertised
   */
  public checkCurrentAdvertisingPayload(): void {
    console.log('=== Current Advertising Payload Check ===');
    
    if (!this.isAdvertising) {
      console.log('❌ No advertising is currently active');
      return;
    }
    
    if (!this.currentPayload) {
      console.log('❌ No payload data available');
      return;
    }
    
    console.log('✅ Currently advertising payload:', this.currentPayload);
    
    // Show the payload bytes
    const payloadBytes = makePayloadBytes(this.currentPayload);
    console.log('Payload bytes:', payloadBytes);
    console.log('Payload bytes (hex):', payloadBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    console.log('Expected manufacturer data (hex):', payloadBytes.map(b => b.toString(16).padStart(2, '0')).join(''));
    
    // Show what a scanner should see
    console.log('Scanner should see:');
    console.log('  - Service UUID:', SERVICE_UID);
    console.log('  - Manufacturer data (hex):', payloadBytes.map(b => b.toString(16).padStart(2, '0')).join(''));
    console.log('  - Manufacturer data (base64):', Buffer.from(payloadBytes).toString('base64'));
    
    console.log('==========================================');
  }

  /**
   * Test both advertising and scanning together
   */
  public async testFullBLEFlow(testId: number = 12345): Promise<void> {
    console.log('=== BLE Full Flow Test ===');
    
    try {
      // Test advertising
      console.log('1. Testing advertising...');
      await this.testAdvertising({ id: testId });
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test scanning
      console.log('2. Testing scanning...');
      await this.scanForStudentAttendance(
        (device) => {
          console.log('Found device during test:', device);
        },
        (devices) => {
          console.log('Test scan complete. Found devices:', devices.length);
        },
        10000 // 10 second test scan
      );
      
      console.log('✅ Full BLE flow test started');
      
    } catch (error) {
      console.error('❌ Full BLE flow test failed:', error);
    }
    console.log('=============================');
  }

  /**
   * Debug scan method - accepts all devices to see what's being detected
   */
  public async debugScan(scanDuration: number = 15000): Promise<void> {
    console.log('=== BLE Debug Scan ===');
    console.log('This will accept ALL devices found for debugging purposes');
    
    try {
      await this.scanForStudentAttendance(
        (device) => {
          console.log('DEBUG: Found device:', device);
        },
        (devices) => {
          console.log('DEBUG: Scan complete. Total devices found:', devices.length);
          if (devices.length === 0) {
            console.log('DEBUG: No devices found. Possible issues:');
            console.log('  - No BLE devices nearby');
            console.log('  - Bluetooth not enabled on nearby devices');
            console.log('  - Library scanning issues');
            console.log('  - Permission problems');
          }
        },
        scanDuration
      );
      
      console.log('DEBUG: Scan started. Check console for device discoveries...');
      
    } catch (error) {
      console.error('DEBUG: Scan failed:', error);
    }
    console.log('=============================');
  }

  /**
   * Test device verification with a specific payload
   */
  public async testDeviceVerification(testPayload: BLEPayload, scanDuration: number = 15000): Promise<void> {
    console.log('=== BLE Device Verification Test ===');
    console.log('Testing payload:', testPayload);
    console.log('Expected payload bytes:', makePayloadBytes(testPayload));
    console.log('Expected payload bytes (hex):', makePayloadBytes(testPayload).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    try {
      await this.scanForStudentAttendance(
        (device) => {
          console.log('VERIFY: Found device:', device.id);
          const isMatch = this.verifyDevicePayload(device, testPayload);
          if (isMatch) {
            console.log('VERIFY: ✅ This device matches your advertising payload!');
          } else {
            console.log('VERIFY: ❌ This device does not match your advertising payload');
          }
        },
        (devices) => {
          console.log('VERIFY: Scan complete. Total devices found:', devices.length);
        },
        scanDuration
      );
      
      console.log('VERIFY: Verification scan started. Check console for matches...');
      
    } catch (error) {
      console.error('VERIFY: Verification scan failed:', error);
    }
    console.log('=====================================');
  }

  /**
   * Manually verify a specific device against a payload
   */
  public verifySpecificDevice(deviceData: DeviceData, expectedPayload: BLEPayload): boolean {
    console.log('=== Manual Device Verification ===');
    console.log('Device data:', deviceData);
    console.log('Expected payload:', expectedPayload);
    
    const isMatch = this.verifyDevicePayload(deviceData, expectedPayload);
    
    if (isMatch) {
      console.log('✅ VERIFIED: This device matches your advertising payload!');
    } else {
      console.log('❌ NOT VERIFIED: This device does not match your advertising payload');
    }
    
    console.log('==================================');
    return isMatch;
  }

  /**
   * Analyze and decode manufacturer data from a scanned device
   */
  public analyzeDeviceManufacturerData(deviceData: DeviceData): void {
    console.log('=== Device Manufacturer Data Analysis ===');
    console.log('Device ID:', deviceData.id);
    console.log('Device Name:', deviceData.name || 'Unknown');
    console.log('RSSI:', deviceData.rssi);
    console.log('Service UUIDs:', deviceData.serviceUUIDs);
    
    if (!deviceData.manufacturerData) {
      console.log('❌ No manufacturer data found');
      return;
    }
    
    console.log('Manufacturer Data (raw):', deviceData.manufacturerData);
    
    try {
      // Convert to bytes
      const bytes = this.hexStringToBytes(deviceData.manufacturerData);
      console.log('Manufacturer Data (bytes):', bytes);
      console.log('Manufacturer Data (hex):', bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
      
      // Try to decode as payload
      if (bytes.length >= 4) {
        const payloadId = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
        console.log('📦 Decoded Payload ID:', payloadId);
        console.log('📦 Decoded Payload ID (hex):', '0x' + payloadId.toString(16).toUpperCase());
        console.log('📦 Decoded Payload ID (binary):', payloadId.toString(2));
      }
      
      // Show in different formats
      console.log('Manufacturer Data (base64):', Buffer.from(bytes).toString('base64'));
      console.log('Manufacturer Data (binary):', bytes.map(b => b.toString(2).padStart(8, '0')).join(' '));
      
    } catch (error) {
      console.error('Error analyzing manufacturer data:', error);
    }
    
    console.log('==========================================');
  }

  /**
   * Quick analysis of the device you just found
   */
  public analyzeFoundDevice(): void {
    console.log('=== Quick Analysis of Found Device ===');
    console.log('Device ID: 4F:70:E7:C6:5E:14');
    console.log('Manufacturer Data: "//8AAAB7"');
    console.log('Actual bytes received: [138, 170, 183]');
    console.log('Bytes (hex): 0x8a 0xaa 0xb7');
    
    console.log('⚠️ ISSUE: Only 3 bytes received, expected 4 bytes for payload');
    console.log('This suggests the advertising function is not sending the full payload');
    
    // Try to decode what we have
    if (3 >= 4) {
      const payloadId = (138 << 24) | (170 << 16) | (183 << 8) | 0;
      console.log('📦 Partial Payload ID (with padding):', payloadId);
    } else {
      console.log('📦 Cannot decode as 32-bit payload (need 4 bytes)');
    }
    
    console.log('=====================================');
  }

  /**
   * Debug method to test BLE functionality
   */
  public async debugBLE(): Promise<void> {
    console.log('=== BLE Debug Information ===');
    console.log('Platform:', Platform.OS);
    console.log('BLE Supported:', this.isSupported());
    console.log('Is Advertising:', this.isAdvertising);
    console.log('Is Scanning:', this.isScanning);
    console.log('Service UID:', SERVICE_UID);
    
    try {
      const blePermissions = await PermissionManager.checkBLEPermissions();
      const locationPermissions = await PermissionManager.checkLocationPermissions();
      console.log('BLE Permissions:', blePermissions);
      console.log('Location Permissions:', locationPermissions);
    } catch (error) {
      console.error('Permission check error:', error);
    }
    console.log('=============================');
  }
}

// Export default instance
const bleInstance = BLE.getInstance();
export default bleInstance;
