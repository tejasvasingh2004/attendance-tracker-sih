import * as BLEAdvertiser from 'react-native-ble-advertiser';
import { NativeEventEmitter, NativeModules } from 'react-native';

// UUID for student attendance BLE service (replace with your actual UUID if different)
const STUDENT_SERVICE_UUID = '0000abcd-0000-1000-8000-00805f9b34fb';

/**
 * Scan for student BLE signals for attendance.
 * @param {function} onStudentFound - Called with each found student device (deviceData)
 * @param {function} onScanComplete - Called with all found students after scan
 * @param {number} scanDuration - Scan duration in ms (default 15000)
 */
export function scanForStudentAttendance(onStudentFound, onScanComplete, scanDuration = 15000) {
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    const foundStudents = [];
    const seenIds = new Set();
    const deviceListener = eventEmitter.addListener('onDeviceFound', (deviceData) => {
        // Project-specific: expect deviceData.name like 'Student_<id>'

            foundStudents.push({
                ...deviceData,
            });
            seenIds.add(deviceData.id);
            if (onStudentFound) onStudentFound(deviceData);
        
    });

    BLEAdvertiser.scanByService(STUDENT_SERVICE_UUID, {
        scanMode: BLEAdvertiser.SCAN_MODE_LOW_LATENCY, //mid 
        matchMode: BLEAdvertiser.MATCH_MODE_STICKY,
        numberOfMatches: BLEAdvertiser.MATCH_NUM_MAX_ADVERTISEMENT,
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
