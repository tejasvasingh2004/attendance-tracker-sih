/**
 * Device-related type definitions
 */

export interface DeviceInfo {
  deviceId: string;
  model: string;
  brand: string;
  systemName: string;
  systemVersion: string;
  isEmulator: boolean;
}

export interface NetworkStatus {
  isConnected: boolean;
  type?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isInternetReachable: boolean;
}
