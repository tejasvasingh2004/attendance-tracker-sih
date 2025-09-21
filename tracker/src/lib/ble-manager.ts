import { Platform } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { BleManager, State } from 'react-native-ble-plx';
import PermissionManager from './permission-manager';
import { Buffer } from 'buffer';

const SERVICE_UID = '0000feed-0000-1000-8000-00805f9b34fb';

export interface BLEPayload {
  id: number;
  name?: string;
}
export interface BLEAdvertisingOptions {
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

/* ===== Helpers ===== */

/*eslint-disable no-bitwise */
function makePayloadBytes(payload: BLEPayload): number[] {
  const { id, name } = payload;
  if (!Number.isInteger(id) || id < 0 || id > 0xffffffff) {
    throw new Error('Payload ID must be a 32-bit unsigned integer');
  }

  // Build big-endian 4 bytes for ID
  const idBytes = [
    (id >>> 24) & 0xff,
    (id >>> 16) & 0xff,
    (id >>> 8) & 0xff,
    id & 0xff,
  ];

  if (name) {
    const nameBytes = Array.from(Buffer.from(name, 'utf8')).slice(0, 8);
    return [...idBytes, ...nameBytes];
  }

  return idBytes;
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


/* ===== BLE Class ===== */
export class BLE {
  private static instance: BLE;
  private isAdvertising: boolean = false;
  private isScanning: boolean = false;
  private currentPayload: BLEPayload | null = null;
  private currentScanStopFunction: (() => void) | null = null;
  private bleManager: BleManager | null = null;

  private constructor() {
    // Don't initialize BleManager in constructor - do it lazily when needed
    console.log('BLE: Instance created, will initialize manager when needed');
  }

  public static getInstance(): BLE {
    if (!BLE.instance) BLE.instance = new BLE();
    return BLE.instance;
  }

  private async ensureBleManager(): Promise<BleManager> {
    if (!this.bleManager) {
      try {
        console.log('BLE: Creating BleManager...');

        // Check if BleManager is available
        if (!BleManager) {
          throw new Error(
            'BleManager is not available. Please check if react-native-ble-plx is properly installed.',
          );
        }

        this.bleManager = new BleManager();
        console.log('BLE: BleManager created successfully');

        // Test if the manager is actually working
        try {
          const state = await this.bleManager.state();
          console.log('BLE: Manager state check successful:', state);
        } catch (stateError) {
          console.error('BLE: Manager state check failed:', stateError);
          throw new Error(
            'BLE manager created but not functional. Please restart the app.',
          );
        }
      } catch (error) {
        console.error('BLE: Failed to create BleManager:', error);
        this.bleManager = null; // Reset to null so we can try again

        // Provide more specific error messages
        if (error instanceof Error) {
          if (error.message.includes('BleManager is not available')) {
            throw new Error(
              'BLE library not properly installed. Please reinstall react-native-ble-plx and rebuild the app.',
            );
          } else if (error.message.includes('not functional')) {
            throw new Error(
              'BLE manager not working properly. Please restart the app and try again.',
            );
          } else {
            throw new Error(`BLE initialization failed: ${error.message}`);
          }
        } else {
          throw new Error(
            'Failed to create BLE manager. Please ensure BLE is supported on this device.',
          );
        }
      }
    }
    return this.bleManager;
  }

  public isSupported(): boolean {
    return Platform.OS === 'android' && !!BLEAdvertiser;
  }

  public async checkBLELibrary(): Promise<{
    available: boolean;
    error?: string;
  }> {
    try {
      console.log('BLE: Checking BLE library availability...');

      if (!BleManager) {
        return { available: false, error: 'BleManager not available' };
      }

      const testManager = new BleManager();

      const state = await testManager.state();
      console.log('BLE: Library check successful, state:', state);

      testManager.destroy();

      return { available: true };
    } catch (error) {
      console.error('BLE: Library check failed:', error);
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async initializeBLE(): Promise<boolean> {
    try {
      const manager = await this.ensureBleManager();
      const state = await manager.state();
      console.log('BLE: Current state:', state);

      if (state === State.PoweredOn) {
        console.log('BLE: Successfully initialized and powered on');
        return true;
      } else {
        console.log('BLE: Not powered on, current state:', state);
        return false;
      }
    } catch (error) {
      console.error('BLE: Failed to initialize:', error);
      return false;
    }
  }

  public async startAdvertising(
    payload: BLEPayload,
  ): Promise<void> {
    validatePayload(payload);
    if (this.isAdvertising)
      throw new Error('Already advertising. Stop current advertising first.');

    console.log('BLE: Requesting BLE permissions...');
    try {
      await PermissionManager.requestBLEPermissions();
      console.log('BLE: BLE permissions granted');
    } catch (error) {
      console.error('BLE: BLE permissions denied:', error);
      throw new Error(
        'Bluetooth permissions are required to start advertising. Please grant permissions and try again.',
      );
    }

    (BLEAdvertiser as typeof BLEAdvertiser).setCompanyId(0xffff);

    const payloadBytes = makePayloadBytes(payload);
    const serviceUid = SERVICE_UID;

    console.log('BLE: Advertising with manufacturer data:', {
      serviceUuid: serviceUid,
      manufacturerData: payloadBytes,
      payload: payload,
    });

    try {
      console.log('BLE: About to broadcast with:', {
        serviceUuid: serviceUid,
        manufacturerData: payloadBytes,
        payloadBytesLength: payloadBytes.length,
        payloadBytesHex: payloadBytes.map(b => b.toString(16).padStart(2, '0')).join(' ')
      });
      
      const result = await (BLEAdvertiser as typeof BLEAdvertiser).broadcast(
        serviceUid,
        payloadBytes, // Use manufacturer data instead of packed UUID
        {
          txPowerLevel: 0,
          includeDeviceName: false,
          includeTxPowerLevel: false,
          connectable: false,
        },
      );
      console.log('BLE: Broadcast result:', result);
      this.isAdvertising = true;
      this.currentPayload = payload;
      console.log(
        `BLE: Started advertising manufacturer data for payload [${payload.id}]`,
      );
    } catch (error) {
      console.error('BLE: Failed to start advertising:', error);
      throw error;
    }
  }

  public async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) {
      console.warn('BLE: No active advertising to stop');
      return;
    }
    try {
      if (typeof (BLEAdvertiser as any).stopBroadcast === 'function') {
        await (BLEAdvertiser as typeof BLEAdvertiser).stopBroadcast();
      }
    } catch (error) {
      console.warn('BLE: stopBroadcast failed:', error);
    }
    this.isAdvertising = false;
    const stoppedPayload = this.currentPayload;
    this.currentPayload = null;
    console.log(
      `BLE: Stopped advertising payload [${stoppedPayload?.id ?? 'unknown'}]`,
    );
  }

  private verifyDevicePayload(
    deviceData: DeviceData,
    expectedPayload: BLEPayload,
  ): boolean {
    try {
      // Check if device has our service UUID and manufacturer data
      if (!deviceData.serviceUUIDs || !deviceData.serviceUUIDs.includes(SERVICE_UID)) {
        console.log('BLE: Device does not have our service UUID');
        return false;
      }

      if (!deviceData.manufacturerData) {
        console.log('BLE: Device has our service UUID but no manufacturer data');
        return false;
      }

      try {
        // Convert manufacturer data to bytes
        let manufacturerBytes: number[];
        if (Array.isArray(deviceData.manufacturerData)) {
          manufacturerBytes = deviceData.manufacturerData.map(b =>
            typeof b === 'string' ? parseInt(b, 16) : b,
          );
        } else {
          manufacturerBytes = Object.values(deviceData.manufacturerData).map(b =>
            typeof b === 'string' ? parseInt(b, 16) : Number(b),
          );
        }

        if (manufacturerBytes.length >= 4) {
          // eslint-disable-next-line no-bitwise
          const id =
            (manufacturerBytes[0] << 24) |
            (manufacturerBytes[1] << 16) |
            (manufacturerBytes[2] << 8) |
            manufacturerBytes[3];

          // Extract name if present
          let name: string | undefined;
          if (manufacturerBytes.length > 4) {
            const nameBytes = manufacturerBytes.slice(4);
            name = Buffer.from(nameBytes).toString('utf8');
          }

          const decodedPayload = { id, name };

          // Verify the payload matches expected
          if (
            decodedPayload.id === expectedPayload.id &&
            decodedPayload.name === expectedPayload.name
          ) {
            console.log(
              'BLE: ✅ Payload verification successful:',
              decodedPayload,
            );
            return true;
          } else {
            console.log(
              'BLE: ❌ Payload mismatch. Expected:',
              expectedPayload,
              'Got:',
              decodedPayload,
            );
            return false;
          }
        }
      } catch (decodeError) {
        console.error(
          'BLE: Error decoding manufacturer data:',
          decodeError,
        );
        return false;
      }

      console.log('BLE: Device does not have valid manufacturer data');
      return false;
    } catch (error) {
      console.error('BLE: Error verifying device payload:', error);
      return false;
    }
  }


  public async scanForStudentAttendance(
    onStudentFound: OnStudentFoundCallback,
    onScanComplete: OnScanCompleteCallback,
    scanDuration: number = 30 * 1000,
  ): Promise<() => void> {
    return this.tryRealBLEScanning(
      onStudentFound,
      onScanComplete,
      scanDuration,
    );
  }

  public stopScan(): void {
    if (!this.isScanning) {
      console.warn('BLE: No active scan to stop');
      return;
    }
    try {
      if (this.bleManager) {
        this.bleManager.stopDeviceScan();
        console.log('BLE: Stop Scan Successful');
      }
    } catch (error) {
      console.log('BLE: Stop Scan Error', error);
    }
    this.isScanning = false;
    this.currentScanStopFunction = null;
  }

  public getScanningStatus(): boolean {
    return this.isScanning;
  }

  public async tryRealBLEScanning(
    onStudentFound: OnStudentFoundCallback,
    onScanComplete: OnScanCompleteCallback,
    scanDuration: number = 30 * 1000,
  ): Promise<() => void> {
    if (this.isScanning) {
      console.warn('BLE: Already scanning. Stop current scan first.');
      return () => {};
    }

    const manager = await this.ensureBleManager();

    console.log('BLE: Requesting BLE permissions...');
    try {
      await PermissionManager.requestBLEPermissions();
      console.log('BLE: BLE permissions granted');
    } catch (error) {
      console.error('BLE: BLE permissions denied:', error);
      throw new Error(
        'Bluetooth permissions are required to start scanning. Please grant permissions and try again.',
      );
    }

    console.log('BLE: Requesting location permissions...');
    try {
      await PermissionManager.requestLocationPermissions();
      console.log('BLE: Location permissions granted');
    } catch (error) {
      console.error('BLE: Location permissions denied:', error);
      throw new Error(
        'Location permissions are required for BLE scanning. Please grant permissions and try again.',
      );
    }

    const state = await manager.state();
    if (state !== State.PoweredOn)
      throw new Error(`Bluetooth is not enabled. Current state: ${state}`);

    this.isScanning = true;
    const foundStudents: DeviceData[] = [];
    const seenIds = new Set<string>();

    // Scan for all devices since we're looking for packed UUIDs that start with our base pattern
    manager.startDeviceScan(
      null, // Scan for all devices, not just specific service UUIDs
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('BLE: Scan error:', error);
          return;
        }
        if (!device) return;

        console.log(
          `BLE: Found device [${device.id}] - Name: ${
            device.name || 'Unknown'
          }`,
        );
        const deviceData: DeviceData = {
          id: device.id,
          name: device.name || undefined,
          rssi: device.rssi,
          serviceUUIDs: device.serviceUUIDs,
          manufacturerData: device.manufacturerData,
          serviceData: device.serviceData,
        };

        // Check for packed UUID in service UUIDs
        let decodedPayload: BLEPayload | null = null;
        if (device.serviceUUIDs && device.serviceUUIDs.includes(SERVICE_UID)) {
          console.log(
            'BLE: ✅ Found device with our service UUID:',
            SERVICE_UID,
          );

          // Check for manufacturer data
          if (device.manufacturerData) {
            try {
              console.log(
                'BLE: Manufacturer data found:',
                device.manufacturerData,
              );

              // Convert manufacturer data to bytes
              let manufacturerBytes: number[];
              if (Array.isArray(device.manufacturerData)) {
                // Convert string array to number array if needed
                manufacturerBytes = device.manufacturerData.map(b =>
                  typeof b === 'string' ? parseInt(b, 16) : b,
                );
              } else {
                manufacturerBytes = Object.values(device.manufacturerData).map(b =>
                  typeof b === 'string' ? parseInt(b, 16) : b,
                );
              }

              console.log('BLE: Manufacturer bytes:', manufacturerBytes);

              // Convert bytes back to payload ID and name
              if (manufacturerBytes.length >= 4) {
                // eslint-disable-next-line no-bitwise
                const id =
                  (manufacturerBytes[0] << 24) |
                  (manufacturerBytes[1] << 16) |
                  (manufacturerBytes[2] << 8) |
                  manufacturerBytes[3];

                // Extract name if present (bytes 4+)
                let name: string | undefined;
                if (manufacturerBytes.length > 4) {
                  const nameBytes = manufacturerBytes.slice(4);
                  name = Buffer.from(nameBytes).toString('utf8');
                }

                decodedPayload = { id, name };
                console.log('BLE: Decoded payload from manufacturer data:', {
                  id,
                  name,
                });
              }
            } catch (decodeError) {
              console.error(
                'BLE: Failed to decode payload from manufacturer data:',
                decodeError,
              );
            }
          } else {
            console.log(
              'BLE: Device has our service UUID but no manufacturer data',
            );
          }
        }

        if (decodedPayload) {
          deviceData.decodedPayload = decodedPayload;
          console.log('BLE: ✅ Device with valid payload:', {
            id: deviceData.id,
            name: deviceData.name,
            payload: decodedPayload,
            rssi: deviceData.rssi,
          });

          if (!seenIds.has(device.id)) {
            foundStudents.push(deviceData);
            seenIds.add(device.id);
            if (onStudentFound) onStudentFound(deviceData);
          }
        } else {
          console.log('BLE: ⚠️ Device without our payload:', {
            id: deviceData.id,
            name: deviceData.name,
            serviceUUIDs: deviceData.serviceUUIDs,
            rssi: deviceData.rssi,
          });
        }
      },
    );

    let timer: ReturnType<typeof setTimeout> | null = null;
    const stopFunction = () => {
      if (timer) clearTimeout(timer);
      try {
        if (this.bleManager) {
          this.bleManager.stopDeviceScan();
        }
      } catch (e) {}
      this.isScanning = false;
      if (onScanComplete) onScanComplete(foundStudents);
    };

    timer = setTimeout(() => {
      try {
        if (this.bleManager) {
          this.bleManager.stopDeviceScan();
        }
      } catch (e) {}
      this.isScanning = false;
      if (onScanComplete) onScanComplete(foundStudents);
    }, scanDuration);

    this.currentScanStopFunction = stopFunction;
    return stopFunction;
  }


  public async testBasicAdvertising(): Promise<void> {
    try {
      console.log('BLE: Requesting BLE permissions for test...');
      try {
        await PermissionManager.requestBLEPermissions();
        console.log('BLE: BLE permissions granted for test');
      } catch (error) {
        console.error('BLE: BLE permissions denied for test:', error);
        throw new Error('Bluetooth permissions are required for test advertising. Please grant permissions and try again.');
      }

      (BLEAdvertiser as any).setCompanyId(0xffff);

      // Create payload with ID and name
      const payload: BLEPayload = {
        id: 123, // Example ID
        name: 'sahil', // Example name
      };

      const payloadBytes = makePayloadBytes(payload);

      console.log('BLE: Test advertising with manufacturer data:', {
        serviceUuid: SERVICE_UID,
        manufacturerData: payloadBytes,
        payload: payload,
        payloadBytesHex: payloadBytes.map(b => b.toString(16).padStart(2, '0')).join(' ')
      });

      await (BLEAdvertiser as typeof BLEAdvertiser).broadcast(
        SERVICE_UID,
        payloadBytes, // Use manufacturer data instead of empty array
        {
          txPowerLevel: 2,
          includeDeviceName: false,
          includeTxPowerLevel: false,
          connectable: false,
        },
      );
      console.log('BLE: Broadcasting for 10 seconds...');
      await new Promise(r => setTimeout(r, 10000)); // 10 seconds instead of 1
      await (BLEAdvertiser as typeof BLEAdvertiser).stopBroadcast();
      console.log('BLE: Broadcasting stopped after 10 seconds');
    } catch (e) {
      console.error('BLE: Test advertising error:', e);
      throw e;
    }
  }


  public async checkPermissions(): Promise<{
    ble: boolean;
    location: boolean;
  }> {
    try {
      const blePerm = await PermissionManager.checkBLEPermissions();
      const locPerm = await PermissionManager.checkLocationPermissions();
      return { ble: blePerm, location: locPerm };
    } catch (error) {
      console.error('BLE: Error checking permissions:', error);
      return { ble: false, location: false };
    }
  }

  public async requestPermissions(): Promise<{
    ble: boolean;
    location: boolean;
  }> {
    try {
      console.log('BLE: Requesting permissions...');

      // Request BLE permissions
      try {
        await PermissionManager.requestBLEPermissions();
        console.log('BLE: BLE permissions granted');
      } catch (error) {
        console.error('BLE: BLE permissions denied:', error);
      }

      // Request location permissions
      try {
        await PermissionManager.requestLocationPermissions();
        console.log('BLE: Location permissions granted');
      } catch (error) {
        console.error('BLE: Location permissions denied:', error);
      }

      // Check final status
      return await this.checkPermissions();
    } catch (error) {
      console.error('BLE: Error requesting permissions:', error);
      return { ble: false, location: false };
    }
  }
}

const bleInstance = BLE.getInstance();
export default bleInstance;
