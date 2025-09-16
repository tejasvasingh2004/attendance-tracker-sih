import * as React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

type ProxyStudent = {
	id: string
	name: string
	avatar: string
	status: 'uploaded' | 'not_uploaded'
	uploadTime?: string
	aiDetection?: {
		confidence: number 
		reason: string
		evidence: string[]
	}
	isRevoked?: boolean
}

const PROXY_STUDENTS: ProxyStudent[] = [
	{
		id: '12345',
		name: 'Amanda Smith',
		avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6lAu2dwzz-euQ8r7bJdu_1jcKYlHECdJSsc73vRdBwdHl-txCqh9LtFN5PsjPKUb73qNZyBAtqYHNu_2OCDH6CW0iueA08O_jrdLy97SMzoaR66YxCY-Y0WFKwrSv4E4XpaGzr-_mLQ9GdYuyL49_NfNJakp3bdJJ4gHabnz3LN6Z7SxOGIS57tyKFYlLEHYPVPE7PxdNspSa2cuO-vKv8MbIagbnsN4O2r-K7dVg19xpSv4qX-zbTmHW1P-_WIQNkCSoBFabtZbV',
		status: 'uploaded',
		uploadTime: '2 minutes ago',
		aiDetection: {
			confidence: 95,
			reason: 'Face mismatch with registered photo',
			evidence: ['Face similarity score: 0.15', 'Different facial features detected']
		}
	},
	{
		id: '12346',
		name: 'John Doe',
		avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVvIpAyzAmZe3IJyzPGGAh9wKs1rn_DvlUWzbcL_Rr8z-S674znoUdg2Z3-_BiG0Azl3mkmoGm9WYd652KvL7mlWVYi3Bi3i6Tti5ye1pXh63VHzumrqCzmB_KobUFD5YtAuZZLXbBSWOyX8NZQQcPbBGno3fJ1h5konUsutidpIukEoa0IEauLvFCTyyqb_UBXL_jE7mdJmByfCrKwwZ5X50rQ5r5KNKgeh6zdWrF9cMDY__gGe1pHbCi9DeSJWv1OLIGpKNKOEp_',
		status: 'not_uploaded'
	},
	{
		id: '12348',
		name: 'Michael Brown',
		avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbAMwrsp_vMpBxoc2WWirf3ScRPclZhsggapVZ9izsHZM_2odk3SAsrnV9nxQHZy2NALDTqeUYqy2AB0Vxj2Z_JKiEvXJbmDrG5YP6fAyKFvBD8tySQ359pf7CzSqewyMPOSYRKFm8yKuIVC42nkldP65SN_Am74pUoCCb__V4XFmB265Qhp4fokivVgPCRsDKqAGGbO2v3ji0JfEJ6d_EUzou9N2l3ef8RJh99mPuimrNz9_qsWV1wdrKgeJYuWl0lyjkG2ngy3Ud',
		status: 'uploaded',
		uploadTime: '5 minutes ago',
		aiDetection: {
			confidence: 87,
			reason: 'Suspicious lighting patterns',
			evidence: ['Inconsistent shadows', 'Artificial lighting detected']
		}
	},
	{
		id: '12350',
		name: 'David Wilson',
		avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6lAu2dwzz-euQ8r7bJdu_1jcKYlHECdJSsc73vRdBwdHl-txCqh9LtFN5PsjPKUb73qNZyBAtqYHNu_2OCDH6CW0iueA08O_jrdLy97SMzoaR66YxCY-Y0WFKwrSv4E4XpaGzr-_mLQ9GdYuyL49_NfNJakp3bdJJ4gHabnz3LN6Z7SxOGIS57tyKFYlLEHYPVPE7PxdNspSa2cuO-vKv8MbIagbnsN4O2r-K7dVg19xpSv4qX-zbTmHW1P-_WIQNkCSoBFabtZbV',
		status: 'not_uploaded'
	},
	{
		id: '12352',
		name: 'Robert Davis',
		avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYpQ6mQo-qYbZ24NgbsC40ph9cpoCExU_dm6PVaOZkjIXfw5s0J2aa8Hc3XzcU27I852L97E8-H-3I9Srguzodf8qmnkHzdPI5lQWml_9vYYWl-sz-EoUrCVROoBWoWnV9EPi4BZB_1wMvF198B9-8kYK9rjwaZXI3PSbx86A5TAwWvP6c5ZXRNnH4ZkivnosRGq0Xm9gQGu8kIl9YPr-8ewb21vw4-zgEdyIPA7bIehPZ6uavxGKScJvUeagjeaCZ3JlLptEdO_KK',
		status: 'uploaded',
		uploadTime: '1 minute ago',
		aiDetection: {
			confidence: 92,
			reason: 'Digital manipulation detected',
			evidence: ['Image metadata inconsistencies', 'Photo editing artifacts found']
		}
	}
]

function ProxyStudentCard({ 
	student, 
	onShowImage, 
	onRevoke 
}: { 
	student: ProxyStudent; 
	onShowImage: (student: ProxyStudent) => void;
	onRevoke: (student: ProxyStudent) => void;
}) {
	const isUploaded = student.status === 'uploaded'
	const hasAiDetection = student.aiDetection !== undefined

	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 90) return '#dc2626' // red
		if (confidence >= 70) return '#f97316' // orange
		return '#eab308' // yellow
	}

	return (
		<View style={{
			padding: 16,
			backgroundColor: 'white',
			borderWidth: 1,
			borderColor: student.isRevoked ? '#fee2e2' : '#e5e7eb',
			borderRadius: 8,
			marginBottom: 16,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.1,
			shadowRadius: 2,
			elevation: 2,
			opacity: student.isRevoked ? 0.8 : 1
		}}>
			<View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
				<Image
					source={{ uri: student.avatar }}
					style={{ 
						width: 48, 
						height: 48, 
						borderRadius: 24,
						opacity: student.isRevoked ? 0.6 : 1
					}}
					resizeMode="cover"
				/>
				<View style={{ flex: 1 }}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<Text style={{ 
							fontWeight: '500', 
							color: student.isRevoked ? '#6b7280' : '#1f2937', 
							fontSize: 16,
							textDecorationLine: student.isRevoked ? 'line-through' : 'none'
						}}>
							{student.name}
						</Text>
						{student.isRevoked && (
							<View style={{
								paddingHorizontal: 8,
								paddingVertical: 2,
								backgroundColor: '#fee2e2',
								borderRadius: 4
							}}>
								<Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '500' }}>
									Revoked
								</Text>
							</View>
						)}
					</View>
					<Text style={{ color: '#6b7280', fontSize: 14 }}>
						ID: {student.id}
					</Text>

					{/* AI Detection Section */}
					{hasAiDetection && (
						<View style={{
							marginTop: 12,
							padding: 12,
							backgroundColor: '#fef3c7',
							borderRadius: 8,
							borderWidth: 1,
							borderColor: '#fde68a'
						}}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
									<MaterialIcons name="warning" size={16} color={getConfidenceColor(student.aiDetection!.confidence)} />
									<Text style={{ fontSize: 14, fontWeight: '600', color: '#92400e' }}>
										AI Detection Alert
									</Text>
								</View>
								<View style={{
									paddingHorizontal: 8,
									paddingVertical: 2,
									backgroundColor: '#fff7ed',
									borderRadius: 12
								}}>
									<Text style={{ 
										color: getConfidenceColor(student.aiDetection!.confidence),
										fontSize: 12,
										fontWeight: '600'
									}}>
										{student.aiDetection!.confidence}% Confidence
									</Text>
								</View>
							</View>
							<Text style={{ fontSize: 14, color: '#92400e', marginBottom: 4 }}>
								{student.aiDetection!.reason}
							</Text>
							<View style={{ gap: 2 }}>
								{student.aiDetection!.evidence.map((evidence, index) => (
									<Text key={index} style={{ fontSize: 12, color: '#92400e', opacity: 0.8 }}>
										• {evidence}
									</Text>
								))}
							</View>
						</View>
					)}

					{/* Status Section */}
					<View style={{ marginTop: 12 }}>
						<View style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
							padding: 12,
							backgroundColor: '#f9fafb',
							borderRadius: 8
						}}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
								<Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
									Status:
								</Text>
								<Text style={{
									fontSize: 14,
									fontWeight: 'bold',
									color: isUploaded ? '#16a34a' : '#dc2626'
								}}>
									{isUploaded ? 'Uploaded' : 'Not Uploaded'}
								</Text>
							</View>
							<View style={{ flexDirection: 'row', gap: 8 }}>
								{isUploaded && !student.isRevoked && (
									<TouchableOpacity
										onPress={() => onShowImage(student)}
										style={{
											paddingHorizontal: 12,
											paddingVertical: 6,
											borderRadius: 6,
											backgroundColor: '#137fec'
										}}
									>
										<Text style={{
											fontSize: 14,
											fontWeight: '600',
											color: 'white'
										}}>
											Show Image
										</Text>
									</TouchableOpacity>
								)}
								{!student.isRevoked && (
									<TouchableOpacity
										onPress={() => onRevoke(student)}
										style={{
											paddingHorizontal: 12,
											paddingVertical: 6,
											borderRadius: 6,
											backgroundColor: '#fee2e2'
										}}
									>
										<Text style={{
											fontSize: 14,
											fontWeight: '600',
											color: '#dc2626'
										}}>
											Revoke
										</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
						{isUploaded && student.uploadTime && (
							<Text style={{
								fontSize: 12,
								color: '#6b7280',
								marginTop: 4,
								textAlign: 'right'
							}}>
								{student.uploadTime}
							</Text>
						)}
					</View>
				</View>
			</View>
		</View>
	)
}

interface ProxyReviewScreenProps {
	session: {
		startEndTime: string
		title: string
		details: string
		imageUri: string
	}
	onBack: () => void
}

export default function ProxyReviewScreen({ session, onBack }: ProxyReviewScreenProps) {
	const [showImageModal, setShowImageModal] = React.useState(false)
	const [showRevokeModal, setShowRevokeModal] = React.useState(false)
	const [selectedStudent, setSelectedStudent] = React.useState<ProxyStudent | null>(null)
	const [students, setStudents] = React.useState<ProxyStudent[]>(PROXY_STUDENTS)

	const handleShowImage = (student: ProxyStudent) => {
		setSelectedStudent(student)
		setShowImageModal(true)
	}

	const handleRevoke = (student: ProxyStudent) => {
		setSelectedStudent(student)
		setShowRevokeModal(true)
	}

	const confirmRevoke = () => {
		if (selectedStudent) {
			setStudents(prev => prev.map(s => 
				s.id === selectedStudent.id ? { ...s, isRevoked: true } : s
			))
			setShowRevokeModal(false)
			setSelectedStudent(null)
		}
	}

	const uploadedCount = students.filter(s => s.status === 'uploaded').length
	const notUploadedCount = students.filter(s => s.status === 'not_uploaded').length
	const aiDetectedCount = students.filter(s => s.aiDetection).length
	const revokedCount = students.filter(s => s.isRevoked).length

	// Separate students into manual and AI-detected sections
	const aiDetectedStudents = students.filter(s => s.aiDetection)
	const manuallyFlaggedStudents = students.filter(s => !s.aiDetection)

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				{/* Header */}
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: 16,
					borderBottomWidth: 1,
					borderBottomColor: '#e5e7eb'
				}}>
					<TouchableOpacity
						onPress={onBack}
						style={{
							padding: 8,
							borderRadius: 20,
							backgroundColor: '#f3f4f6'
						}}
					>
						<MaterialIcons name="arrow-back" size={24} color="#6b7280" />
					</TouchableOpacity>
					<View style={{ alignItems: 'center' }}>
						<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
							Proxy Review
						</Text>
						<Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>
							{session.title}
						</Text>
					</View>
					<View style={{ width: 40, height: 40 }} />
				</View>

				<ScrollView 
					style={{ flex: 1 }} 
					contentContainerStyle={{ paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
				>
					<View style={{ padding: 16, paddingTop: 24 }}>
						{/* Description */}
						<View style={{ 
							alignItems: 'center', 
							marginBottom: 24,
							backgroundColor: '#f8fafc',
							padding: 16,
							borderRadius: 12,
							borderWidth: 1,
							borderColor: '#e2e8f0'
						}}>
							<MaterialIcons name="info-outline" size={24} color="#64748b" style={{ marginBottom: 8 }} />
							<Text style={{
								fontSize: 16,
								color: '#64748b',
								textAlign: 'center',
								lineHeight: 24,
								fontWeight: '500'
							}}>
								Review photos submitted by students flagged for potential proxy attendance.
							</Text>
						</View>

						{/* Summary Stats */}
						<View style={{
							marginBottom: 24,
							padding: 16,
							backgroundColor: 'white',
							borderRadius: 12,
							borderWidth: 1,
							borderColor: '#e5e7eb',
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 1 },
							shadowOpacity: 0.1,
							shadowRadius: 2,
							elevation: 2
						}}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
								<Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>
									Flagged Students ({students.length})
								</Text>
								<View style={{
									paddingHorizontal: 12,
									paddingVertical: 4,
									backgroundColor: '#fee2e2',
									borderRadius: 16
								}}>
									<Text style={{ color: '#dc2626', fontSize: 14, fontWeight: '500' }}>
										{revokedCount} Revoked
									</Text>
								</View>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
									<View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#16a34a' }} />
									<Text style={{ color: '#6b7280', fontSize: 14 }}>
										Uploaded ({uploadedCount})
									</Text>
								</View>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
									<View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#dc2626' }} />
									<Text style={{ color: '#6b7280', fontSize: 14 }}>
										Not Uploaded ({notUploadedCount})
									</Text>
								</View>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
									<View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#f97316' }} />
									<Text style={{ color: '#6b7280', fontSize: 14 }}>
										AI Detected ({aiDetectedCount})
									</Text>
								</View>
							</View>
						</View>

						{/* AI Detection Section */}
						{aiDetectedStudents.length > 0 && (
							<View style={{ marginBottom: 24 }}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
									<MaterialIcons name="auto-awesome" size={24} color="#f97316" />
									<Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>
										AI-Detected Proxy Cases
									</Text>
								</View>
								{aiDetectedStudents.map((student) => (
									<ProxyStudentCard
										key={student.id}
										student={student}
										onShowImage={handleShowImage}
										onRevoke={handleRevoke}
									/>
								))}
							</View>
						)}

						{/* Manual Review Section */}
						{manuallyFlaggedStudents.length > 0 && (
							<View style={{ marginBottom: 24 }}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
									<MaterialIcons name="person" size={24} color="#6b7280" />
									<Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>
										Manual Review Cases
									</Text>
								</View>
								{manuallyFlaggedStudents.map((student) => (
									<ProxyStudentCard
										key={student.id}
										student={student}
										onShowImage={handleShowImage}
										onRevoke={handleRevoke}
									/>
								))}
							</View>
						)}
					</View>
				</ScrollView>

				{/* Bottom Navigation */}
				<View style={{
					backgroundColor: 'white',
					borderTopWidth: 1,
					borderTopColor: '#e5e7eb',
					paddingTop: 8,
					paddingBottom: 24,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.05,
					shadowRadius: 4,
					elevation: 4
				}}>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'space-around',
						alignItems: 'center',
						paddingHorizontal: 16
					}}>
						<TouchableOpacity style={{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
							paddingVertical: 8
						}}>
							<MaterialIcons name="home" size={24} color="#6b7280" />
							<Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>
								Home
							</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
							paddingVertical: 8,
							marginHorizontal: 8,
							backgroundColor: '#eff6ff',
							borderRadius: 12,
							paddingHorizontal: 16
						}}>
							<MaterialIcons name="checklist" size={24} color="#137fec" />
							<Text style={{ fontSize: 12, fontWeight: '500', color: '#137fec', marginTop: 4 }}>
								Attendance
							</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{
							flex: 1,
							alignItems: 'center',
							justifyContent: 'center',
							paddingVertical: 8
						}}>
							<MaterialIcons name="person" size={24} color="#6b7280" />
							<Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>
								Profile
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Image Modal */}
			<Modal
				visible={showImageModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowImageModal(false)}
				statusBarTranslucent
			>
				<View style={{
					flex: 1,
					backgroundColor: 'rgba(0,0,0,0.85)',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20
				}}>
					<View style={{
						backgroundColor: 'white',
						borderRadius: 24,
						padding: 24,
						width: '100%',
						maxWidth: 400,
						alignItems: 'center',
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.2,
						shadowRadius: 8,
						elevation: 8
					}}>
						<View style={{ 
							flexDirection: 'row', 
							alignItems: 'center', 
							gap: 8, 
							marginBottom: 20 
						}}>
							<MaterialIcons name="photo-camera" size={24} color="#1f2937" />
							<Text style={{
								fontSize: 20,
								fontWeight: 'bold',
								color: '#1f2937'
							}}>
								{selectedStudent?.name}&apos;s Photo
							</Text>
						</View>
						<View style={{
							width: '100%',
							aspectRatio: 4/3,
							backgroundColor: '#f3f4f6',
							borderRadius: 16,
							justifyContent: 'center',
							alignItems: 'center',
							marginBottom: 24,
							borderWidth: 1,
							borderColor: '#e5e7eb',
							overflow: 'hidden'
						}}>
							<MaterialIcons name="image" size={64} color="#9ca3af" />
							<Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12, fontWeight: '500' }}>
								Photo Preview
							</Text>
						</View>
						<View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
							<TouchableOpacity
								onPress={() => setShowImageModal(false)}
								style={{
									flex: 1,
									paddingVertical: 14,
									paddingHorizontal: 20,
									borderRadius: 12,
									backgroundColor: '#f3f4f6',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 8
								}}
							>
								<MaterialIcons name="close" size={20} color="#6b7280" />
								<Text style={{
									color: '#6b7280',
									fontWeight: '600',
									fontSize: 16
								}}>
									Close
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => {
									setShowImageModal(false)
									handleRevoke(selectedStudent!)
								}}
								style={{
									flex: 1,
									paddingVertical: 14,
									paddingHorizontal: 20,
									borderRadius: 12,
									backgroundColor: '#fee2e2',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 8
								}}
							>
								<MaterialIcons name="block" size={20} color="#dc2626" />
								<Text style={{
									color: '#dc2626',
									fontWeight: '600',
									fontSize: 16
								}}>
									Revoke
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			{/* Revoke Confirmation Modal */}
			<Modal
				visible={showRevokeModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowRevokeModal(false)}
				statusBarTranslucent
			>
				<View style={{
					flex: 1,
					backgroundColor: 'rgba(0,0,0,0.85)',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20
				}}>
					<View style={{
						backgroundColor: 'white',
						borderRadius: 24,
						padding: 24,
						width: '100%',
						maxWidth: 400,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.2,
						shadowRadius: 8,
						elevation: 8
					}}>
						<View style={{ alignItems: 'center', marginBottom: 20 }}>
							<View style={{
								width: 72,
								height: 72,
								borderRadius: 36,
								backgroundColor: '#fee2e2',
								justifyContent: 'center',
								alignItems: 'center',
								marginBottom: 20,
								shadowColor: '#dc2626',
								shadowOffset: { width: 0, height: 2 },
								shadowOpacity: 0.1,
								shadowRadius: 4,
								elevation: 2
							}}>
								<MaterialIcons name="warning" size={36} color="#dc2626" />
							</View>
							<Text style={{
								fontSize: 24,
								fontWeight: 'bold',
								color: '#1f2937',
								marginBottom: 12,
								textAlign: 'center'
							}}>
								Revoke Attendance?
							</Text>
							<Text style={{
								color: '#6b7280',
								textAlign: 'center',
								marginBottom: 8,
								fontSize: 16,
								lineHeight: 24
							}}>
								Are you sure you want to revoke attendance for:
							</Text>
							<Text style={{
								fontSize: 18,
								fontWeight: '600',
								color: '#1f2937',
								marginBottom: 16
							}}>
								{selectedStudent?.name}
							</Text>
							{selectedStudent?.aiDetection && (
								<View style={{
									backgroundColor: '#fef3c7',
									padding: 16,
									borderRadius: 12,
									marginBottom: 16,
									width: '100%',
									borderWidth: 1,
									borderColor: '#fde68a'
								}}>
									<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
										<MaterialIcons name="auto-awesome" size={20} color="#92400e" />
										<Text style={{ color: '#92400e', fontWeight: '600', fontSize: 16 }}>
											AI Detection Result
										</Text>
									</View>
									<Text style={{ color: '#92400e', fontSize: 15, lineHeight: 22 }}>
										{selectedStudent.aiDetection.reason}
									</Text>
								</View>
							)}
						</View>
						<View style={{ flexDirection: 'row', gap: 12 }}>
							<TouchableOpacity
								onPress={() => setShowRevokeModal(false)}
								style={{
									flex: 1,
									paddingVertical: 14,
									paddingHorizontal: 20,
									borderRadius: 12,
									backgroundColor: '#f3f4f6',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 8
								}}
							>
								<MaterialIcons name="close" size={20} color="#6b7280" />
								<Text style={{
									color: '#6b7280',
									fontWeight: '600',
									fontSize: 16
								}}>
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={confirmRevoke}
								style={{
									flex: 1,
									paddingVertical: 14,
									paddingHorizontal: 20,
									borderRadius: 12,
									backgroundColor: '#dc2626',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 8
								}}
							>
								<MaterialIcons name="block" size={20} color="white" />
								<Text style={{
									color: 'white',
									fontWeight: '600',
									fontSize: 16
								}}>
									Revoke
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	)
}
