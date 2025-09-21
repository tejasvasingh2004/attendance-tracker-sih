import { Platform } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { BleManager, State } from 'react-native-ble-plx';
import PermissionManager from './permission-manager';
import { Buffer } from 'buffer';

// Constants
const SERVICE_UID = '0000feed-0000-1000-8000-00805f9b34fb';

// Types
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
  const idBytes = [(id >>> 24) & 0xff, (id >>> 16) & 0xff, (id >>> 8) & 0xff, id & 0xff];
  
  // Add name bytes if provided (up to 8 bytes to fit in 12 total)
  if (name) {
    const nameBytes = Array.from(Buffer.from(name, 'utf8')).slice(0, 8);
    return [...idBytes, ...nameBytes];
  }
  
  return idBytes;
}

// Pack up to 12 bytes into the UUID's last bytes
function packIntoUuid(baseUuid: string, bytes: number[]): string {
  // baseUuid like '0000feed-0000-1000-8000-00805f9b34fb'
  // UUID format: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
  // We'll replace the last 12 hex chars (6 bytes) with our payload
  const hex = Buffer.from(bytes).toString('hex').padEnd(12, '0').slice(0, 12);
  return baseUuid.slice(0, 24) + hex;
}

// Unpack bytes from UUID's last bytes
function unpackFromUuid(packedUuid: string): number[] {
  // Extract the last 12 hex characters (6 bytes) from the UUID
  const hex = packedUuid.slice(-12);
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
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

function bytesToBase64(bytes: number[]): string {
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer.from(bytes).toString('base64');
  }
  try {
    let binary = '';
    for (let i = 0; i < bytes.length; i++)
      binary += String.fromCharCode(bytes[i]);
    if (typeof btoa === 'function') return btoa(binary);
  } catch (e) {}
  throw new Error('No base64 encoder available in this environment');
}

function base64ToBytes(b64: string): number[] {
  // Prefer Buffer if available
  // @ts-ignore
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    // @ts-ignore
    return Array.from(Buffer.from(b64, 'base64'));
  }
  try {
    // @ts-ignore
    const binary = typeof atob === 'function' ? atob(b64) : null;
    if (binary === null) throw new Error('No base64 decoder');
    const bytes: number[] = [];
    for (let i = 0; i < binary.length; i++) bytes.push(binary.charCodeAt(i));
    return bytes;
  } catch (e) {
    throw new Error('No base64 decoder available in this environment');
  }
}

/**
 * Accepts manufacturerData strings (hex or base64) and returns byte array.
 * react-native-ble-plx often provides base64-encoded manufacturerData.
 */
function encodeStringToBytes(data: string): number[] {
  if (!data) return [];
  const cleanHex = data.replace(/[^0-9A-Fa-f]/g, '');
  // If string looks like hex and has even length, parse as hex
  if (
    cleanHex.length > 0 &&
    cleanHex.length % 2 === 0 &&
    /^[0-9A-Fa-f]+$/.test(cleanHex)
  ) {
    const bytes: number[] = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    return bytes;
  }
  // Otherwise, try base64 decode
  try {
    return base64ToBytes(data);
  } catch (e) {
    // last resort: try direct hex parse (len could be odd)
    const fallback: number[] = [];
    for (let i = 0; i < data.length; i++) {
      // eslint-disable-next-line no-bitwise
      fallback.push(data.charCodeAt(i) & 0xff);
    }
    return fallback;
  }
}


/* ===== BLE Class ===== */
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
    if (!BLE.instance) BLE.instance = new BLE();
    return BLE.instance;
  }

  public isSupported(): boolean {
    return Platform.OS === 'android' && !!BLEAdvertiser && !!this.bleManager;
  }

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

  public async startAdvertising(
    payload: BLEPayload,
    options: BLEAdvertisingOptions = {},
  ): Promise<void> {
    validatePayload(payload);
    if (this.isAdvertising)
      throw new Error('Already advertising. Stop current advertising first.');

    await PermissionManager.requestBLEPermissions();

    (BLEAdvertiser as typeof BLEAdvertiser).setCompanyId(0xFFFF);

    const payloadBytes = makePayloadBytes(payload);
    const serviceUid = options.serviceUid ?? SERVICE_UID;

    // Pack payload bytes into UUID
    const packedUuid = packIntoUuid(serviceUid, payloadBytes.slice(0, 12));
    
    console.log('BLE: Advertising with packed UUID:', { 
      originalUuid: serviceUid, 
      packedUuid,
      payloadBytes: payloadBytes.slice(0, 12)
    });

    try {
      const result = await (BLEAdvertiser as typeof BLEAdvertiser).broadcast(
        packedUuid,
        [],
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
        `BLE: Started advertising packed UUID for payload [${payload.id}]`,
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
      // Check if device has our packed UUID and verify the payload
      if (!deviceData.serviceUUIDs) {
        console.log('BLE: Device has no service UUIDs');
        return false;
      }

      for (const uuid of deviceData.serviceUUIDs) {
        if (uuid.startsWith(SERVICE_UID.slice(0, 24))) {
          console.log('BLE: Found packed UUID:', uuid);
          try {
            // Unpack the payload from the UUID
            const unpackedBytes = unpackFromUuid(uuid);
            if (unpackedBytes.length >= 4) {
              // eslint-disable-next-line no-bitwise
              const id = (unpackedBytes[0] << 24) | (unpackedBytes[1] << 16) | (unpackedBytes[2] << 8) | unpackedBytes[3];
              
              // Extract name if present
              let name: string | undefined;
              if (unpackedBytes.length > 4) {
                const nameBytes = unpackedBytes.slice(4);
                name = Buffer.from(nameBytes).toString('utf8');
              }
              
              const decodedPayload = { id, name };
              
              // Verify the payload matches expected
              if (decodedPayload.id === expectedPayload.id && decodedPayload.name === expectedPayload.name) {
                console.log('BLE: ✅ Payload verification successful:', decodedPayload);
                return true;
              } else {
                console.log('BLE: ❌ Payload mismatch. Expected:', expectedPayload, 'Got:', decodedPayload);
                return false;
              }
            }
          } catch (unpackError) {
            console.error('BLE: Error unpacking payload from UUID:', unpackError);
            return false;
          }
        }
      }

      console.log('BLE: Device does not have our packed UUID');
      return false;
    } catch (error) {
      console.error('BLE: Error verifying device payload:', error);
      return false;
    }
  }

  private hexStringToBytes(hexStringOrBase64: string): number[] {
    // kept for backward compatibility; delegates to encodeStringToBytes
    return encodeStringToBytes(hexStringOrBase64);
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
      this.bleManager.stopDeviceScan();
      console.log('BLE: Stop Scan Successful');
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
    await PermissionManager.requestBLEPermissions();
    await PermissionManager.requestLocationPermissions();

    const state = await this.bleManager.state();
    if (state !== State.PoweredOn)
      throw new Error(`Bluetooth is not enabled. Current state: ${state}`);

    this.isScanning = true;
    const foundStudents: DeviceData[] = [];
    const seenIds = new Set<string>();

    // Scan for all devices since we're looking for packed UUIDs that start with our base pattern
    this.bleManager.startDeviceScan(
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
        if (device.serviceUUIDs) {
          for (const uuid of device.serviceUUIDs) {
            // Check if this UUID starts with our base UUID pattern (first 24 chars)
            if (uuid.startsWith(SERVICE_UID.slice(0, 24))) {
              console.log('BLE: ✅ Found device with packed UUID:', uuid);
              try {
                // Unpack the payload from the UUID
                const unpackedBytes = unpackFromUuid(uuid);
                console.log('BLE: Unpacked bytes from UUID:', unpackedBytes);
                
                // Convert bytes back to payload ID and name
                if (unpackedBytes.length >= 4) {
                  // eslint-disable-next-line no-bitwise
                  const id = (unpackedBytes[0] << 24) | (unpackedBytes[1] << 16) | (unpackedBytes[2] << 8) | unpackedBytes[3];
                  
                  // Extract name if present (bytes 4+)
                  let name: string | undefined;
                  if (unpackedBytes.length > 4) {
                    const nameBytes = unpackedBytes.slice(4);
                    name = Buffer.from(nameBytes).toString('utf8');
                  }
                  
                  decodedPayload = { id, name };
                  console.log('BLE: Decoded payload:', { id, name });
                }
              } catch (decodeError) {
                console.error('BLE: Failed to decode payload from UUID:', decodeError);
              }
              break;
            }
          }
        }
        
        if (decodedPayload) {
          deviceData.decodedPayload = decodedPayload;
          console.log('BLE: ✅ Device with valid payload:', {
            id: deviceData.id,
            name: deviceData.name,
            payload: decodedPayload,
            rssi: deviceData.rssi
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
            rssi: deviceData.rssi
          });
        }
      },
    );

    let timer: ReturnType<typeof setTimeout> | null = null;
    const stopFunction = () => {
      if (timer) clearTimeout(timer);
      try {
        this.bleManager.stopDeviceScan();
      } catch (e) {}
      this.isScanning = false;
      if (onScanComplete) onScanComplete(foundStudents);
    };

    timer = setTimeout(() => {
      try {
        this.bleManager.stopDeviceScan();
      } catch (e) {}
      this.isScanning = false;
      if (onScanComplete) onScanComplete(foundStudents);
    }, scanDuration);

    this.currentScanStopFunction = stopFunction;
    return stopFunction;
  }

  public async testAdvertising(payload: BLEPayload): Promise<void> {
    console.log('=== BLE Advertising Test ===');
    console.log('Note: Advertising with service data (no company ID needed)');
    try {
      await this.startAdvertising(payload);
      console.log('✅ Advertising started successfully');
      console.log('Payload bytes:', makePayloadBytes(payload));
    } catch (error) {
      console.error('❌ Advertising failed:', error);
    }
    console.log('=============================');
  }

  public async testAdvertisingWithCompanyId(
    payload: BLEPayload,
  ): Promise<void> {
    console.log('=== Service Data Testing ===');
    console.log('Note: Testing advertising with service data');
    console.log('No company ID needed when using service data');

    try {
      await this.testAdvertising(payload);
      await new Promise(r => setTimeout(r, 2000));
      await this.stopAdvertising();
      console.log('✅ Advertising test completed successfully');
    } catch (e) {
      console.error('❌ Error testing advertising:', e);
    }
    console.log('==========================');
  }

  public async testBasicAdvertising(): Promise<void> {
    try {
      // Set dummy company ID to avoid "Invalid company id" error
      (BLEAdvertiser as any).setCompanyId(0xffff);

      await (BLEAdvertiser as typeof BLEAdvertiser).broadcast(
        SERVICE_UID,
        [], // Use empty array
        {
          includeDeviceName: false,
          includeTxPowerLevel: false,
          connectable: false,
        },
      );
      await new Promise(r => setTimeout(r, 1000));
      await (BLEAdvertiser as any).stopBroadcast();
    } catch (e) {
      console.error(e);
    }
  }

  public checkCurrentAdvertisingPayload(): void {
    if (!this.isAdvertising || !this.currentPayload) {
      console.log('No active advertising');
      return;
    }
    const payloadBytes = makePayloadBytes(this.currentPayload);
    console.log('Currently advertising payload:', this.currentPayload);
    console.log(
      'Payload bytes (hex):',
      payloadBytes.map(b => b.toString(16).padStart(2, '0')).join(''),
    );
    try {
      console.log('Manufacturer base64:', bytesToBase64(payloadBytes));
    } catch (_) {}
  }

  public async testFullBLEFlow(testId: number = 0xffff): Promise<void> {
    try {
      await this.testAdvertising({ id: testId });
      await new Promise(r => setTimeout(r, 1000));
      await this.scanForStudentAttendance(
        d => console.log('Found during full flow test', d),
        devices =>
          console.log('Full flow scan complete. Found:', devices.length),
        10000,
      );
    } catch (e) {
      console.error('Full flow test failed', e);
    }
  }

  public async debugScan(scanDuration: number = 15000): Promise<void> {
    console.log('DEBUG: Starting full scan');
    await this.scanForStudentAttendance(
      d => console.log('DEBUG device:', d),
      devices => console.log('DEBUG done. total:', devices.length),
      scanDuration,
    );
  }

  public verifySpecificDevice(
    deviceData: DeviceData,
    expectedPayload: BLEPayload,
  ): boolean {
    const isMatch = this.verifyDevicePayload(deviceData, expectedPayload);
    if (isMatch) console.log('✅ VERIFIED');
    else console.log('❌ NOT VERIFIED');
    return isMatch;
  }

  public analyzeDeviceServiceData(deviceData: DeviceData): void {
    console.log(
      'Device:',
      deviceData.id,
      'serviceData:',
      deviceData.serviceData,
    );
    if (!deviceData.serviceData || !deviceData.serviceData[SERVICE_UID])
      return console.log('No service data for our service UUID');
    try {
      const bytes = encodeStringToBytes(deviceData.serviceData[SERVICE_UID]);
      console.log(
        'Bytes:',
        bytes,
        'Base64:',
        typeof Buffer !== 'undefined'
          ? Buffer.from(bytes).toString('base64')
          : 'n/a',
      );
    } catch (e) {
      console.error(e);
    }
  }

  public async debugBLE(): Promise<void> {
    console.log('Platform:', Platform.OS, 'BLE Supported:', this.isSupported());
    try {
      const blePerm = await PermissionManager.checkBLEPermissions();
      const locPerm = await PermissionManager.checkLocationPermissions();
      console.log('Permissions:', { blePerm, locPerm });
    } catch (e) {
      console.warn(e);
    }
  }
}

const bleInstance = BLE.getInstance();
export default bleInstance;
