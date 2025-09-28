/**
 * BLE-related type definitions
 */

export interface BLEPayload {
  id: number;
  e?: string;
}

export interface BLEAdvertisingOptions {
  txPowerLevel?: 0 | 1 | 2 | 3; // 3 = HIGH
  advertiseMode?: 0 | 1 | 2; // 2 = LOW_LATENCY
  includeDeviceName?: boolean;
  includeTxPowerLevel?: boolean;
  connectable?: boolean;
}

export interface BLEScanOptions {
  legacyScan?: boolean;
  timeoutMs?: number;
}
