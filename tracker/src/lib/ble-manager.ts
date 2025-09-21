import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
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

  private constructor() {}

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
      }

      // Create payload bytes
      const payloadBytes = makePayloadBytes(payload);
      const serviceUid = options.serviceUid ?? SERVICE_UID;

      // Start advertising
      await BLEAdvertiser.broadcast(serviceUid, payloadBytes, {});

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
    return Platform.OS === 'android' && typeof BLEAdvertiser !== 'undefined';
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

    BLEAdvertiser.stopScan()
      .then(success => console.log('BLE: Stop Scan Successful', success))
      .catch(error => console.log('BLE: Stop Scan Error', error));

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
   * Real BLE scanning method
   * Attempts to detect BLE devices broadcasting with our service UID
   */
  public async tryRealBLEScanning(
    onStudentFound: OnStudentFoundCallback,
    onScanComplete: OnScanCompleteCallback,
    scanDuration: number = 30 * 1000,
  ): Promise<() => void> {
    console.log('BLE: Starting real BLE scanning...');
    
    if (this.isScanning) {
      console.warn('BLE: Already scanning. Stop current scan first.');
      return () => {};
    }

    try {
      // Request permissions before scanning
      await PermissionManager.requestBLEPermissions();
      await PermissionManager.requestLocationPermissions();

      this.isScanning = true;
      const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
      const foundStudents: DeviceData[] = [];
      const seenIds = new Set<string>();

      const deviceListener = eventEmitter.addListener(
        'onDeviceFound',
        (deviceData: DeviceData) => {
          console.log(`BLE: Found device [${deviceData.id}] - Full data:`, JSON.stringify(deviceData, null, 2));
          
          // For now, accept ALL devices to see what's being detected
          if (!seenIds.has(deviceData.id)) {
            foundStudents.push(deviceData);
            seenIds.add(deviceData.id);
            console.log(`BLE: ✅ Found device [${deviceData.id}] - accepting all for debugging`);
            if (onStudentFound) onStudentFound(deviceData);
          }
        },
      );

      // Try scanning strategies in order of preference
      const tryScanningStrategies = async () => {
        console.log('BLE: Trying scanByService...');
        try {
          await BLEAdvertiser.scanByService(SERVICE_UID, {
            scanMode: 0, // SCAN_MODE_LOW_POWER
            matchMode: 2, // MATCH_MODE_STICKY
            numberOfMatches: 1, // MATCH_NUM_ONE_ADVERTISEMENT
            reportDelay: 1000,
          });
          console.log('BLE: ✅ scanByService started successfully!');
          return true;
        } catch (error) {
          console.log('BLE: ❌ scanByService failed:', (error as Error).message);
        }

        console.log('BLE: Trying scanByService with empty options...');
        try {
          await BLEAdvertiser.scanByService(SERVICE_UID, {});
          console.log('BLE: ✅ scanByService with empty options started successfully!');
          return true;
        } catch (error) {
          console.log('BLE: ❌ scanByService with empty options failed:', (error as Error).message);
        }

        console.log('BLE: Trying basic scan method...');
        if (typeof BLEAdvertiser.scan === 'function') {
          try {
            await BLEAdvertiser.scan([], {});
            console.log('BLE: ✅ Basic scan started successfully!');
            return true;
          } catch (error) {
            console.log('BLE: ❌ Basic scan failed:', (error as Error).message);
          }
        }

        return false;
      };

      tryScanningStrategies().then(success => {
        if (!success) {
          console.error('BLE: All scanning strategies failed. Check library compatibility.');
          this.isScanning = false;
          deviceListener.remove();
          if (onScanComplete) onScanComplete([]);
        }
      }).catch(error => {
        console.error('BLE: Unexpected error during scanning:', error);
        this.isScanning = false;
        deviceListener.remove();
        if (onScanComplete) onScanComplete([]);
      });

      // Store listener for cleanup
      const stopFunction = () => {
        clearTimeout(timer);
        deviceListener.remove();
        this.stopScan();
        if (onScanComplete) onScanComplete(foundStudents);
      };

      // Stop scan after scanDuration ms
      const timer = setTimeout(() => {
        deviceListener.remove();
        this.stopScan();
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
  public async testAdvertising(payload: BLEPayload): Promise<void> {
    console.log('=== BLE Advertising Test ===');
    console.log('Payload:', payload);
    console.log('Service UID:', SERVICE_UID);
    
    try {
      await this.startAdvertising(payload);
      console.log('✅ Advertising started successfully');
      
      // Log the payload bytes for debugging
      const payloadBytes = makePayloadBytes(payload);
      console.log('Payload bytes:', payloadBytes);
      console.log('Payload bytes (hex):', payloadBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
      
    } catch (error) {
      console.error('❌ Advertising failed:', error);
    }
    console.log('=============================');
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
