import BLEAdvertiser from 'react-native-ble-advertiser';
import { NativeEventEmitter, NativeModules } from 'react-native';

// Constants - synced with ble-manager.ts
const SERVICE_UID = '0000feed-0000-1000-8000-00805f9b34fb';
const DEV_COMPANY_ID = 0xffff;

// Types - synced with ble-manager.ts
export interface BLEPayload {
  id: number;
}

export interface BLEAdvertisingOptions {
  companyId?: number;
  serviceUid?: string;
}

interface DeviceData {
    id: string;
    name?: string;
    [key: string]: any;
}

type OnStudentFoundCallback = (deviceData: DeviceData) => void;
type OnScanCompleteCallback = (foundStudents: DeviceData[]) => void;

// Utility functions - synced with ble-manager.ts approach
function validatePayload(payload: BLEPayload): void {
  if (typeof payload.id !== 'number' || !Number.isInteger(payload.id)) {
    throw new Error('Payload ID must be a valid integer');
  }
  
  if (payload.id < 0 || payload.id > 0xffffffff) {
    throw new Error('Payload ID must be between 0 and 4294967295');
  }
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

/**
 * Scan for student BLE signals for attendance.
 * @param {function} onStudentFound - Called with each found student device (deviceData)
 * @param {function} onScanComplete - Called with all found students after scan
 * @param {number} scanDuration - Scan duration in ms (default 15000)
 */
export function scanForStudentAttendance(
    onStudentFound: OnStudentFoundCallback, 
    onScanComplete: OnScanCompleteCallback, 
    scanDuration: number = 15000
) {
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    const foundStudents: DeviceData[] = [];
    const seenIds = new Set<string>();
    const deviceListener = eventEmitter.addListener('onDeviceFound', (deviceData: DeviceData) => {
        // Project-specific: expect deviceData.name like 'Student_<id>'

            foundStudents.push({
                ...deviceData,
            });
            seenIds.add(deviceData.id);
            if (onStudentFound) onStudentFound(deviceData);
        
    });

    BLEAdvertiser.scanByService(SERVICE_UID, {
        scanMode: 1, // Dummy value for testing
        matchMode: 1, // Dummy value for testing
        numberOfMatches: 10, // Dummy value for testing
        reportDelay: 0,
    })
        .then(success => console.log('Scan Successful', success))
        .catch(error => console.log('Scan Error', error));

    // Stop scan after scanDuration ms
    const timer = setTimeout(() => {
        BLEAdvertiser.stopScan() //! unders temp.tsx
            .then(success => console.log('Stop Scan Successful', success))
            .catch(error => console.log('Stop Scan Error', error));
        deviceListener.remove();
        if (onScanComplete) onScanComplete(foundStudents);
    }, scanDuration);

    // Return a function to manually stop scan if needed
    return () => {
        clearTimeout(timer);
        BLEAdvertiser.stopScan()
            .then(success => console.log('Stop Scan Successful', success))
            .catch(error => console.log('Stop Scan Error', error));
        deviceListener.remove();
        if (onScanComplete) onScanComplete(foundStudents);
    };
}

/**
 * Start BLE advertising for student attendance.
 * @param {BLEPayload} payload - The payload to advertise
 * @param {BLEAdvertisingOptions} options - Advertising options
 */
export async function startStudentAdvertising(
    payload: BLEPayload,
    options: BLEAdvertisingOptions = {}
): Promise<void> {
    try {
        // Validate payload
        validatePayload(payload);

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

        console.log(`BLE: Started advertising payload [${payload.id}]`);
    } catch (error) {
        console.error('BLE: Failed to start advertising:', error);
        throw error;
    }
}

/**
 * Stop BLE advertising.
 */
export async function stopStudentAdvertising(): Promise<void> {
    try {
        if (typeof BLEAdvertiser.stopBroadcast === 'function') {
            await BLEAdvertiser.stopBroadcast();
        }
        console.log('BLE: Stopped advertising');
    } catch (error) {
        console.error('BLE: Failed to stop advertising:', error);
        throw error;
    }
}

// // BLE scanning utility for teacher attendance
// import { BleManager, Device } from 'react-native-ble-plx';

// /**
//  * Scan for student devices broadcasting BLE signals.
//  * @param {function} onDeviceFound - Callback for each found device (device: Device) => void
//  * @param {function} onScanComplete - Callback when scan is complete (devices: Device[]) => void
//  * @param {number} scanDuration - Duration to scan in ms (default 15000)
//  */
// export function scanForStudentDevices(onDeviceFound, onScanComplete, scanDuration = 15000) {
// 	const manager = new BleManager();
// 	const foundDevices = [];
// 	const seenIds = new Set();

// 	const subscription = manager.startDeviceScan(null, null, (error, device) => {
// 		if (error) {
// 			console.log('BLE scan error:', error);
// 			manager.stopDeviceScan();
// 			onScanComplete(foundDevices);
// 			return;
// 		}
// 		if (device && device.name && device.name.startsWith('Student_') && !seenIds.has(device.id)) {
// 			foundDevices.push(device);
// 			seenIds.add(device.id);
// 			if (onDeviceFound) onDeviceFound(device);
// 		}
// 	});

// 	setTimeout(() => {
// 		manager.stopDeviceScan();
// 		subscription && subscription.remove && subscription.remove();
// 		onScanComplete(foundDevices);
// 	}, scanDuration);

// 	// Return a function to manually stop scan if needed
// 	return () => {
// 		manager.stopDeviceScan();
// 		subscription && subscription.remove && subscription.remove();
// 		onScanComplete(foundDevices);
// 	};
// }
