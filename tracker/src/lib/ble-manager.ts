import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import PermissionManager from './permission-manager';

// Constants
const SERVICE_UID = '0000feed-0000-1000-8000-00805f9b34fb';
const DEV_COMPANY_ID = 0xffff;

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
    options: BLEAdvertisingOptions = {}
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

      // Set company ID if supported
      const companyId = options.companyId ?? DEV_COMPANY_ID;
      if (typeof BLEAdvertiser.setCompanyId === 'function') {
        BLEAdvertiser.setCompanyId(companyId);
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

      console.log(`BLE: Stopped advertising payload [${stoppedPayload?.id || 'unknown'}]`);
    } catch (error) {
      console.error('BLE: Failed to stop advertising:', error);
      throw error;
    }
  }

  public getAdvertisingStatus(): { isAdvertising: boolean; payload: BLEPayload | null } {
    return {
      isAdvertising: this.isAdvertising,
      payload: this.currentPayload,
    };
  }

  public async restartAdvertising(
    payload: BLEPayload,
    options: BLEAdvertisingOptions = {}
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
  public scanForStudentAttendance(
    onStudentFound: OnStudentFoundCallback,
    onScanComplete: OnScanCompleteCallback,
    scanDuration: number = 15000
  ): () => void {
    if (this.isScanning) {
      console.warn('BLE: Already scanning. Stop current scan first.');
      return () => {};
    }

    this.isScanning = true;
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    const foundStudents: DeviceData[] = [];
    const seenIds = new Set<string>();

    const deviceListener = eventEmitter.addListener('onDeviceFound', (deviceData: DeviceData) => {
      if (!seenIds.has(deviceData.id)) {
        foundStudents.push(deviceData);
        seenIds.add(deviceData.id);
        console.log(`BLE: Found student device [${deviceData.id}]`);
        if (onStudentFound) onStudentFound(deviceData);
      }
    });

    // Store listener for cleanup
    this.currentScanStopFunction = () => {
      clearTimeout(timer);
      deviceListener.remove();
      this.stopScan();
      if (onScanComplete) onScanComplete(foundStudents);
    };

    BLEAdvertiser.scanByService(SERVICE_UID, {
      scanMode: 1, // Dummy value for testing
      matchMode: 1, // Dummy value for testing
      numberOfMatches: 10, // Dummy value for testing
      reportDelay: 0,
    })
      .then(success => console.log('BLE: Scan Started Successfully', success))
      .catch(error => console.log('BLE: Scan Start Error', error));

    // Stop scan after scanDuration ms
    const timer = setTimeout(() => {
      deviceListener.remove();
      this.stopScan();
      if (onScanComplete) onScanComplete(foundStudents);
    }, scanDuration);

    return this.currentScanStopFunction;
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
}

// Export default instance
const bleInstance = BLE.getInstance();
export default bleInstance;