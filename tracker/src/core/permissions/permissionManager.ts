/**
 * Permission Manager
 * Centralized permission handling for Android devices
 */

import { Platform, PermissionsAndroid, Permission } from 'react-native';
import { PermissionResult, PermissionGroup } from './types';

export const PERMISSION_GROUPS = {
  BLUETOOTH: {
    name: 'Bluetooth',
    permissions: [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ].filter(Boolean),
  },
  LOCATION: {
    name: 'Location',
    permissions: [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ].filter(Boolean),
  },
  STORAGE: {
    name: 'Storage',
    permissions: [
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ].filter(Boolean),
  },
} as const;

export class PermissionManager {
  private static instance: PermissionManager;

  private constructor() {}

  public static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Request permissions for a specific group
   */
  public async requestPermissionGroup(group: PermissionGroup): Promise<PermissionResult> {
    if (Platform.OS !== 'android') {
      return { granted: true, deniedPermissions: [] };
    }

    console.log(`PermissionManager: Requesting ${group.name} permissions:`, group.permissions);

    try {
      const deniedPermissions: string[] = [];
      
      // Request permissions one by one for better user experience
      for (const permission of group.permissions) {
        console.log(`PermissionManager: Requesting permission: ${permission}`);
        
        const result = await PermissionsAndroid.request(
          permission as Permission,
          {
            title: `${group.name} Permission`,
            message: `This app needs ${group.name.toLowerCase()} permission to work properly.`,
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        console.log(`PermissionManager: Permission ${permission} result:`, result);
        
        if (result !== 'granted') {
          deniedPermissions.push(permission);
        }
      }

      const granted = deniedPermissions.length === 0;
      console.log(`PermissionManager: ${group.name} permissions result:`, { granted, deniedPermissions });

      return {
        granted,
        deniedPermissions,
      };
    } catch (error) {
      console.error(`PermissionManager: Failed to request ${group.name} permissions:`, error);
      throw new Error(`Failed to request ${group.name} permissions: ${error}`);
    }
  }

  /**
   * Check if permissions for a specific group are granted
   */
  public async checkPermissionGroup(group: PermissionGroup): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const results = await Promise.all(
        group.permissions.map(permission => 
          PermissionsAndroid.check(permission as Permission)
        )
      );
      
      return results.every(status => status === true);
    } catch (error) {
      console.error(`Error checking ${group.name} permissions:`, error);
      return false;
    }
  }

  /**
   * BLE-specific permission methods
   */
  public async requestBLEPermissions(): Promise<void> {
    const result = await this.requestPermissionGroup(PERMISSION_GROUPS.BLUETOOTH);
    if (!result.granted) {
      throw new Error(`Bluetooth permissions denied: ${result.deniedPermissions.join(', ')}`);
    }
  }

  public async checkBLEPermissions(): Promise<boolean> {
    return this.checkPermissionGroup(PERMISSION_GROUPS.BLUETOOTH);
  }

  /**
   * Location-specific permission methods
   */
  public async requestLocationPermissions(): Promise<void> {
    const result = await this.requestPermissionGroup(PERMISSION_GROUPS.LOCATION);
    if (!result.granted) {
      throw new Error(`Location permissions denied: ${result.deniedPermissions.join(', ')}`);
    }
  }

  public async checkLocationPermissions(): Promise<boolean> {
    return this.checkPermissionGroup(PERMISSION_GROUPS.LOCATION);
  }

  /**
   * Storage-specific permission methods
   */
  public async requestStoragePermissions(): Promise<void> {
    const result = await this.requestPermissionGroup(PERMISSION_GROUPS.STORAGE);
    if (!result.granted) {
      throw new Error(`Storage permissions denied: ${result.deniedPermissions.join(', ')}`);
    }
  }

  public async checkStoragePermissions(): Promise<boolean> {
    return this.checkPermissionGroup(PERMISSION_GROUPS.STORAGE);
  }

  /**
   * Get all available permission groups
   */
  public getAvailablePermissionGroups(): PermissionGroup[] {
    return Object.values(PERMISSION_GROUPS);
  }

  /**
   * Check if running on Android (where permissions are required)
   */
  public isAndroid(): boolean {
    return Platform.OS === 'android';
  }
}

// Export default instance
export default PermissionManager.getInstance();
