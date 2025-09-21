import { Platform } from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import PermissionManager from './permission-manager';

const SERVICE_UID = '0000feed-0000-1000-8000-00805f9b34fb';
const COMPANY_ID = 0xffff;

export interface BLEPayload {
  id: number;
  e?: string; // Hex data field
}

/* ===== Helpers ===== */

/*eslint-disable no-bitwise */
function makePayloadBytes(payload: BLEPayload): number[] {
  const { id, e } = payload;
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

  if (e) {
    // Convert hex string to bytes
    const hexBytes = [];
    for (let i = 0; i < e.length; i += 2) {
      const hexByte = e.substr(i, 2);
      hexBytes.push(parseInt(hexByte, 16));
    }
    return [...idBytes, ...hexBytes];
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

/* ===== Simple BLE Advertiser Class ===== */
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
      hex: payloadBytes.map(b => b.toString(16).padStart(2, '0')).join(' ')
    });

    try {
      await (BLEAdvertiser as typeof BLEAdvertiser).broadcast(
        SERVICE_UID,
        payloadBytes,
        {
          txPowerLevel: 2,
          includeDeviceName: false,
          includeTxPowerLevel: false,
          connectable: false,
        },
      );
      
      this.isAdvertising = true;
      this.currentPayload = payload;
      console.log(`BLE: ✅ Advertising started for student ID: ${payload.id}`);
    } catch (error) {
      console.error('BLE: ❌ Advertising failed:', error);
      throw new Error(`Failed to start advertising: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.log(`BLE: ✅ Advertising stopped for student ID: ${this.currentPayload?.id ?? 'unknown'}`);
    } catch (error) {
      console.warn('BLE: stopBroadcast failed:', error);
    }
    
    this.isAdvertising = false;
    this.currentPayload = null;
  }

  /**
   * Get current advertising status
   */
  public getAdvertisingStatus(): boolean {
    return this.isAdvertising;
  }

  /**
   * Get current advertising payload
   */
  public getCurrentPayload(): BLEPayload | null {
    return this.currentPayload;
  }

  /**
   * Helper method to request BLE permissions
   */
  private async requestBLEPermissions(): Promise<void> {
    try {
      await PermissionManager.requestBLEPermissions();
      console.log('BLE: ✅ BLE permissions granted');
    } catch (error) {
      console.error('BLE: ❌ BLE permissions denied:', error);
      throw new Error('Bluetooth permissions are required. Please grant permissions and try again.');
    }
  }
}

const bleInstance = BLE.getInstance();
export default bleInstance;