import * as React from 'react'
import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

interface ProxyAlertModalProps {
	visible: boolean
	onClose: () => void
	onTakeAction: () => void
	expectedHeadcount: number
	currentAttendance: number
}

export default function ProxyAlertModal({ visible, onClose, onTakeAction, expectedHeadcount, currentAttendance }: ProxyAlertModalProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
				<View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '100%', maxWidth: 384, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
					<View style={{ alignItems: 'center', marginBottom: 16 }}>
						<View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' }}>
							<MaterialIcons name="warning" size={32} color="#ef4444" />
						</View>
					</View>
					<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>Proxy Alert!</Text>
					<Text style={{ color: '#6b7280', marginBottom: 16, textAlign: 'center', fontSize: 16 }}>
						Attendance count exceeds expected headcount from classroom image.
					</Text>
					<View style={{ 
						backgroundColor: '#fef2f2', 
						borderRadius: 8, 
						padding: 16, 
						marginBottom: 24,
						borderWidth: 1,
						borderColor: '#fecaca'
					}}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
							<Text style={{ color: '#374151', fontWeight: '500' }}>Expected Headcount:</Text>
							<Text style={{ color: '#374151', fontWeight: '600' }}>{expectedHeadcount}</Text>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
							<Text style={{ color: '#374151', fontWeight: '500' }}>Current Attendance:</Text>
							<Text style={{ color: '#ef4444', fontWeight: '600' }}>{currentAttendance}</Text>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<Text style={{ color: '#374151', fontWeight: '500' }}>Difference:</Text>
							<Text style={{ color: '#ef4444', fontWeight: '600' }}>+{currentAttendance - expectedHeadcount}</Text>
						</View>
					</View>
					<Text style={{ color: '#6b7280', marginBottom: 24, textAlign: 'center', fontSize: 14 }}>
						This suggests someone may be attempting proxy attendance. Please review the attendance list.
					</Text>
					<TouchableOpacity
						style={{ width: '100%', backgroundColor: '#137fec', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }}
						onPress={onTakeAction}
						accessibilityRole="button"
					>
						<Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Take Action</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}
