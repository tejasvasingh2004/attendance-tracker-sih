import { Platform } from 'react-native';
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
  private currentPayload: BLEPayload | null = null;

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
}

// Export default instance
const bleInstance = BLE.getInstance();
export default bleInstance;