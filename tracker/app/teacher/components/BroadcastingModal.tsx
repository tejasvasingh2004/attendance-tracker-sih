import * as React from 'react'
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

interface BroadcastingModalProps {
	visible: boolean
	onClose: () => void
}

export default function BroadcastingModal({ visible, onClose }: BroadcastingModalProps) {
	const pulseAnim = React.useRef(new Animated.Value(1)).current

	React.useEffect(() => {
		if (visible) {
			const pulse = Animated.loop(
				Animated.sequence([
					Animated.timing(pulseAnim, {
						toValue: 0.3,
						duration: 1000,
						useNativeDriver: true,
					}),
					Animated.timing(pulseAnim, {
						toValue: 1,
						duration: 1000,
						useNativeDriver: true,
					}),
				])
			)
			pulse.start()
			return () => pulse.stop()
		}
	}, [visible, pulseAnim])

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View style={{ 
				position: 'absolute', 
				top: 0, 
				left: 0, 
				right: 0, 
				bottom: 0, 
				backgroundColor: 'rgba(0,0,0,0.5)', 
				justifyContent: 'center', 
				alignItems: 'center', 
				padding: 16,
				zIndex: 20
			}}>
				<View style={{ 
					backgroundColor: 'white', 
					borderRadius: 16, 
					padding: 32, 
					width: '100%', 
					maxWidth: 384, 
					shadowColor: '#000', 
					shadowOffset: { width: 0, height: 2 }, 
					shadowOpacity: 0.25, 
					shadowRadius: 3.84, 
					elevation: 5,
					alignItems: 'center'
				}}>
					<View style={{ 
						position: 'relative', 
						width: 128, 
						height: 128, 
						marginBottom: 24,
						justifyContent: 'center',
						alignItems: 'center'
					}}>
						<Animated.View style={{
							position: 'absolute',
							width: 128,
							height: 128,
							borderRadius: 64,
							backgroundColor: '#dbeafe',
							opacity: pulseAnim,
						}} />
						<Animated.View style={{
							position: 'absolute',
							width: 96,
							height: 96,
							borderRadius: 48,
							backgroundColor: '#bfdbfe',
							opacity: pulseAnim,
						}} />
						<View style={{
							position: 'relative',
							zIndex: 10,
						}}>
							<MaterialIcons name="wifi-tethering" size={48} color="#137fec" />
						</View>
					</View>
					
					<Text style={{ 
						fontSize: 24, 
						fontWeight: 'bold', 
						color: '#111827', 
						marginBottom: 8, 
						textAlign: 'center' 
					}}>Broadcasting Signal</Text>
					
					<Text style={{ 
						color: '#6b7280', 
						marginBottom: 24, 
						textAlign: 'center' 
					}}>Scanning for nearby devices. Please wait...</Text>
					
					<TouchableOpacity
						style={{ 
							width: '100%', 
							backgroundColor: '#e5e7eb', 
							paddingVertical: 12, 
							paddingHorizontal: 16, 
							borderRadius: 8,
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.1,
							shadowRadius: 2,
							elevation: 2
						}}
						onPress={onClose}
						accessibilityRole="button"
					>
						<Text style={{ 
							color: '#374151', 
							fontWeight: 'bold', 
							textAlign: 'center',
							fontSize: 18
						}}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	)
}
