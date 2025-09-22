import { Platform } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import PermissionManager from './permission-manager';

const SERVICE_UID = '0000feed-0000-1000-8000-00805f9b34fb';
const COMPANY_ID = 0xffff;

export interface BLEPayload {
  id: number;
  e?: string;
}

/**
 * Convert string -> Uint8Array (ASCII/UTF-8)
 */
function stringToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array -> string
 */
function bytesToString(bytes: Uint8Array): string {
  return String.fromCharCode(...bytes);
}

/**
 * Encode payload into byte array
 */
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

/**
 * Decode byte array back into payload
 */
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
export class BLE {
  private static instance: BLE;
  private isAdvertising: boolean = false;
  private currentPayload: BLEPayload | null = null;

  private constructor() {
    console.log('BLE: Simple advertiser instance created');
  }

  public static getInstance(): BLE {
    if (!BLE.instance) BLE.instance = new BLE();
    return BLE.instance;
  }

  public isSupported(): boolean {
    return Platform.OS === 'android' && !!BLEAdvertiser;
  }
chr
  /**
   * Start advertising with payload
   */
  public async startAdvertising(payload: BLEPayload): Promise<void> {
    validatePayload(payload);

    if (this.isAdvertising) {
      throw new Error('Already advertising. Stop current advertising first.');
    }

    await this.requestBLEPermissions();

    (BLEAdvertiser as typeof BLEAdvertiser).setCompanyId(COMPANY_ID);

    const payloadBytes = makePayloadBytes(payload);

    console.log('BLE: Broadcasting payload:', {
      id: payload.id,
      e: payload.e,
      bytes: payloadBytes.length,
      hex: Array.from(payloadBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' '),
    });

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
      console.log(`BLE: ✅ Advertising started for ID: ${payload.id}`);
    } catch (error) {
      console.error('BLE: ❌ Advertising failed:', error);
      throw new Error(
        `Failed to start advertising: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Stop advertising
   */
  public async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) {
      console.warn('BLE: No active advertising to stop');
      return;
    }

    try {
      await (BLEAdvertiser as typeof BLEAdvertiser).stopBroadcast();
      console.log(
        `BLE: ✅ Advertising stopped for ID: ${
          this.currentPayload?.id ?? 'unknown'
        }`,
      );
    } catch (error) {
      console.warn('BLE: stopBroadcast failed:', error);
    }

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
      console.log('BLE: ✅ BLE permissions granted');
    } catch (error) {
      console.error('BLE: ❌ BLE permissions denied:', error);
      throw new Error(
        'Bluetooth permissions are required. Please grant permissions and try again.',
      );
    }
  }
}

const bleInstance = BLE.getInstance();
export default bleInstance;
