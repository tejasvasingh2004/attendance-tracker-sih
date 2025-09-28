/**
 * Device Information Utilities
 * Centralized device information management
 */

import DeviceInfo from 'react-native-device-info';
import { DeviceInfo as DeviceInfoType } from './types';

export class DeviceInfoUtils {
  /**
   * Get unique device ID
   */
  static async getDeviceId(): Promise<string> {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      return deviceId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return 'unknown-device';
    }
  }

  /**
   * Get comprehensive device information
   */
  static async getDeviceInfo(): Promise<DeviceInfoType> {
    try {
      const [
        deviceId,
        model,
        brand,
        systemName,
        systemVersion,
        isEmulator,
      ] = await Promise.all([
        DeviceInfo.getUniqueId(),
        DeviceInfo.getModel(),
        DeviceInfo.getBrand(),
        DeviceInfo.getSystemName(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.isEmulator(),
      ]);

      return {
        deviceId,
        model,
        brand,
        systemName,
        systemVersion,
        isEmulator,
      };
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {
        deviceId: 'unknown-device',
        model: 'unknown',
        brand: 'unknown',
        systemName: 'unknown',
        systemVersion: 'unknown',
        isEmulator: false,
      };
    }
  }

  /**
   * Check if device is emulator
   */
  static async isEmulator(): Promise<boolean> {
    try {
      return await DeviceInfo.isEmulator();
    } catch (error) {
      console.error('Failed to check if device is emulator:', error);
      return false;
    }
  }
}

export default DeviceInfoUtils;
