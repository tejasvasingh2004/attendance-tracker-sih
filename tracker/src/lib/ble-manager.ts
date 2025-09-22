import { Platform } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import PermissionManager from './permission-manager';
import {
  BleManager,
  Device,
  State as BluetoothState,
  type UUID,
} from 'react-native-ble-plx';

const SERVICE_UID = '0000feed-0000-1000-8000-00805f9b34fb';
const COMPANY_ID = 0xffff;

export interface BLEPayload {
  id: number;
  e?: string;
}

function stringToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

function bytesToString(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes);
}

function makePayloadBytes(payload: BLEPayload): Uint8Array {
  const { id, e } = payload;
  if (!Number.isInteger(id) || id < 0 || id > 0xffffffff) {
    throw new Error('Payload ID must be a 32-bit unsigned integer');
  }

  const eBytes = e ? stringToBytes(e) : new Uint8Array(0);

  const buffer = new Uint8Array(4 + eBytes.length);
  const view = new DataView(buffer.buffer);

  view.setUint32(0, id);
  buffer.set(eBytes, 4);

  return buffer;
}

function decodePayloadBytes(bytes: Uint8Array): BLEPayload {
  const view = new DataView(bytes.buffer);
  const id = view.getUint32(0);
  const eBytes = bytes.slice(4);

  return {
    id,
    e: eBytes.length > 0 ? bytesToString(eBytes) : undefined,
  };
}

function validatePayload(payload: BLEPayload): void {
  if (typeof payload.id !== 'number' || !Number.isInteger(payload.id)) {
    throw new Error('Payload ID must be a valid integer');
  }
  if (payload.id < 0 || payload.id > 0xffffffff) {
    throw new Error('Payload ID must be between 0 and 4294967295');
  }
}

function base64ToBytes(base64: string): Uint8Array {
  // Use atob if available (React Native Hermes often provides it). Fallback to manual decode.
  try {
    if (typeof atob === 'function') {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i) & 0xff;
      return bytes;
    }
  } catch (_e) {}

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const clean = base64.replace(/[^A-Za-z0-9+/=]/g, '');
  const output: number[] = [];
  let bc = 0;
  let bs = 0;
  for (let i = 0; i < clean.length; i++) {
    const idx = chars.indexOf(clean.charAt(i));
    if (idx < 0 || idx === 64) break;
    bs = (bs << 6) | idx;
    bc += 6;
    if (bc >= 8) {
      bc -= 8;
      output.push((bs >> bc) & 0xff);
    }
  }
  return new Uint8Array(output);
}

export class BLE {
  private static instance: BLE;
  private isAdvertising: boolean = false;
  private currentPayload: BLEPayload | null = null;

  private bleManager: BleManager | null = null;
  private isScanning: boolean = false;
  private scanTimeoutId: number | null = null;

  private constructor() {}

  public static getInstance(): BLE {
    if (!BLE.instance) BLE.instance = new BLE();
    return BLE.instance;
  }

  public isSupported(): boolean {
    return Platform.OS === 'android' && !!BLEAdvertiser;
  }

  public async startAdvertising(payload: BLEPayload): Promise<void> {
    validatePayload(payload);

    if (this.isAdvertising) {
      throw new Error('Already advertising. Stop current advertising first.');
    }

    await this.requestBLEPermissions();

    (BLEAdvertiser as typeof BLEAdvertiser).setCompanyId(COMPANY_ID);

    const payloadBytes = makePayloadBytes(payload);

    try {
      await (BLEAdvertiser as typeof BLEAdvertiser).broadcast(
        SERVICE_UID,
        Array.from(payloadBytes),
        {
          txPowerLevel: 2,
          includeDeviceName: false,
          includeTxPowerLevel: false,
          connectable: false,
        },
      );

      this.isAdvertising = true;
      this.currentPayload = payload;
    } catch (error) {
      throw new Error(
        `Failed to start advertising: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  public async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) {
      return;
    }

    try {
      await (BLEAdvertiser as typeof BLEAdvertiser).stopBroadcast();
    } catch (error) {}

    this.isAdvertising = false;
    this.currentPayload = null;
  }

  public getAdvertisingStatus(): boolean {
    return this.isAdvertising;
  }

  public getCurrentPayload(): BLEPayload | null {
    return this.currentPayload;
  }

  public decodePayload(bytes: number[]): BLEPayload {
    return decodePayloadBytes(new Uint8Array(bytes));
  }

  private async requestBLEPermissions(): Promise<void> {
    try {
      await PermissionManager.requestBLEPermissions();
    } catch (error) {
      throw new Error(
        'Bluetooth permissions are required. Please grant permissions and try again.',
      );
    }
  }

  private ensureBleManager(): BleManager {
    if (!this.bleManager) {
      this.bleManager = new BleManager();
    }
    return this.bleManager;
  }

  public async initializeScanner(): Promise<void> {
    await this.requestBLEPermissions();
    const manager = this.ensureBleManager();
    await new Promise<void>(resolve => {
      const sub = manager.onStateChange(state => {
        if (state === BluetoothState.PoweredOn) {
          sub.remove();
          resolve();
        }
      }, true);
    });
  }

  public async startScan(
    onDeviceFound: (device: Device) => void,
    uuids: UUID[] | null = null,
    options?: { legacyScan?: boolean },
    timeoutMs?: number,
  ): Promise<void> {
    if (this.isScanning) return;
    await this.initializeScanner();
    const manager = this.ensureBleManager();

    this.isScanning = true;
    manager.startDeviceScan(uuids, { legacyScan: options?.legacyScan, allowDuplicates: true }, (error, device) => {
      if (error) {
        this.stopScan();
        return;
      }
      if (device) {
        try {
          const hasMfd = !!(device as any).manufacturerData;
          const sd = (device as any).serviceData as Record<string, string> | null | undefined;
          const sdKeys = sd ? Object.keys(sd) : [];
          console.log('[BLE] Scan hit', {
            id: device.id,
            name: device.name,
            rssi: device.rssi,
            hasManufacturerData: hasMfd,
            serviceDataKeys: sdKeys,
          });
          const payload = this.extractPayloadFromDevice(device);
          if (payload) {
            console.log('[BLE] Decoded payload', {
              deviceId: device.id,
              name: device.name,
              rssi: device.rssi,
              payload,
            });
          } else {
            console.log('[BLE] No decodable payload for device', device.id);
          }
        } catch (_e) {}
        onDeviceFound(device);
      }
    });

    if (timeoutMs && timeoutMs > 0) {
      this.scanTimeoutId = (setTimeout(() => this.stopScan(), timeoutMs) as unknown) as number;
    }
  }

  public stopScan(): void {
    if (!this.bleManager) {
      this.isScanning = false;
      return;
    }
    this.bleManager.stopDeviceScan();
    this.isScanning = false;
    if (this.scanTimeoutId) {
      clearTimeout(this.scanTimeoutId as unknown as number);
      this.scanTimeoutId = null;
    }
  }

  public isScanningActive(): boolean {
    return this.isScanning;
  }

  public async getBluetoothState(): Promise<BluetoothState> {
    const manager = this.ensureBleManager();
    return manager.state();
  }

  public destroyScanner(): void {
    this.stopScan();
    this.bleManager?.destroy();
    this.bleManager = null;
  }

  public extractPayloadFromDevice(device: Device): BLEPayload | null {
    try {
      // Prefer Manufacturer Data: first 2 bytes are company ID (little-endian)
      const mfd = (device as any).manufacturerData as string | null | undefined;
      if (mfd) {
        const bytes = base64ToBytes(mfd);
        if (bytes.length >= 6) {
          const companyId = bytes[0] | (bytes[1] << 8);
          if (companyId === COMPANY_ID) {
            const payloadBytes = bytes.slice(2);
            if (payloadBytes.length >= 4) {
              return decodePayloadBytes(payloadBytes);
            }
          }
        }
      }

      const serviceData = (device as any).serviceData as Record<string, string> | null | undefined;
      if (serviceData && typeof serviceData === 'object') {
        const key = Object.keys(serviceData).find(k => k?.toLowerCase() === SERVICE_UID.toLowerCase());
        if (key) {
          const dataB64 = serviceData[key];
          if (dataB64) {
            const payloadBytes = base64ToBytes(dataB64);
            if (payloadBytes.length >= 4) {
              return decodePayloadBytes(payloadBytes);
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}

const bleInstance = BLE.getInstance();
export default bleInstance;
