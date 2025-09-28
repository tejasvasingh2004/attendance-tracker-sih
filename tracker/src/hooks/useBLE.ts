/**
 * BLE Hooks
 * Specialized hooks for Bluetooth Low Energy operations
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import BLEManager from '../core/ble/bleManager';
import { BLEPayload, BLEAdvertisingOptions, BLEScanOptions } from '../core/ble/types';
import { Device } from 'react-native-ble-plx';

/**
 * Hook for BLE advertising operations
 */
export function useBLEAdvertising() {
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [currentPayload, setCurrentPayload] = useState<BLEPayload | null>(null);
  const advertisingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (advertisingRef.current) {
        BLEManager.stopAdvertising().catch(() => {});
      }
    };
  }, []);

  const startAdvertising = useCallback(async (
    payload: BLEPayload,
    options: BLEAdvertisingOptions = {}
  ) => {
    try {
      if (!BLEManager.isSupported()) {
        Alert.alert('Error', 'BLE advertising is not supported on this device');
        return false;
      }

      await BLEManager.startAdvertising(payload, options);
      advertisingRef.current = true;
      setIsAdvertising(true);
      setCurrentPayload(payload);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Advertise Failed', errorMessage);
      return false;
    }
  }, []);

  const stopAdvertising = useCallback(async () => {
    try {
      await BLEManager.stopAdvertising();
      advertisingRef.current = false;
      setIsAdvertising(false);
      setCurrentPayload(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to stop advertising: ${errorMessage}`);
    }
  }, []);

  return {
    isAdvertising,
    currentPayload,
    startAdvertising,
    stopAdvertising,
    isSupported: BLEManager.isSupported(),
  };
}

/**
 * Hook for BLE scanning operations
 */
export function useBLEScanning() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Record<string, Device & { payload?: BLEPayload | null }>>({});

  useEffect(() => {
    return () => {
      if (BLEManager.isScanningActive()) {
        BLEManager.stopScan();
      }
    };
  }, []);

  const startScan = useCallback(async (
    onDeviceFound?: (device: Device) => void,
    options: BLEScanOptions = {},
    timeoutMs?: number
  ) => {
    try {
      setDevices({});
      setIsScanning(true);

      await BLEManager.startScan(
        (device) => {
          const payload = BLEManager.extractPayloadFromDevice(device);
          setDevices(prev => ({
            ...prev,
            [device.id]: { ...device, payload: payload || undefined } as Device & { payload?: BLEPayload | null | undefined }
          }));
          
          if (onDeviceFound) {
            onDeviceFound(device);
          }
        },
        null,
        options,
        timeoutMs
      );

      if (timeoutMs) {
        setTimeout(() => setIsScanning(BLEManager.isScanningActive()), timeoutMs + 1000);
      }
    } catch (error) {
      setIsScanning(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Scan Failed', errorMessage);
    }
  }, []);

  const stopScan = useCallback(() => {
    try {
      BLEManager.stopScan();
      setIsScanning(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to stop scan: ${errorMessage}`);
    }
  }, []);

  const clearDevices = useCallback(() => {
    setDevices({});
  }, []);

  return {
    isScanning,
    devices,
    startScan,
    stopScan,
    clearDevices,
    deviceCount: Object.keys(devices).length,
  };
}
