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
		<View className={`p-3 bg-white border rounded-lg mb-3 shadow-sm ${student.isRevoked ? 'border-red-100 opacity-80' : 'border-gray-200'}`}>
			<View className="flex-row items-start">
				<Image
					source={{ uri: student.avatar }}
					className={`w-10 h-10 rounded-full flex-shrink-0 ${student.isRevoked ? 'opacity-60' : ''}`}
					resizeMode="cover"
				/>
				<View className="flex-1 min-w-0 ml-2.5">
					<View className="flex-row justify-between items-center">
						<Text className={`text-sm font-medium flex-shrink truncate max-w-[70%] ${student.isRevoked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
							{student.name}
						</Text>
						{student.isRevoked && (
							<View className="px-1.5 py-0.5 bg-red-100 rounded flex-shrink-0 ml-1">
								<Text className="text-xs font-medium text-red-600">
									Revoked
								</Text>
							</View>
						)}
					</View>
					<Text className="text-xs text-gray-500 mt-0.5">
						ID: {student.id}
					</Text>

					{/* AI Detection Section */}
					{hasAiDetection && (
						<View className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
							<View className="flex-row justify-between items-center mb-2">
								<View className="flex-row items-center space-x-1.5">
									<MaterialIcons name="warning" size={16} color={getConfidenceColor(student.aiDetection!.confidence)} />
									<Text className="text-sm font-semibold text-amber-800">
										AI Detection Alert
									</Text>
								</View>
								<View className="px-2 py-0.5 bg-amber-50/80 rounded-full">
									<Text className="text-xs font-semibold" style={{ color: getConfidenceColor(student.aiDetection!.confidence) }}>
										{student.aiDetection!.confidence}% Confidence
									</Text>
								</View>
							</View>
							<Text className="text-sm text-amber-800 mb-1">
								{student.aiDetection!.reason}
							</Text>
							<View className="space-y-0.5">
								{student.aiDetection!.evidence.map((evidence, index) => (
									<Text key={index} className="text-xs text-amber-800/80">
										• {evidence}
									</Text>
								))}
							</View>
						</View>
					)}

					{/* Status Section */}
					<View className="mt-3">
						<View className="flex-row items-center justify-between p-2.5 bg-gray-50 rounded-lg">
							<View className="flex-row items-center space-x-1.5 flex-shrink">
								<MaterialIcons 
									name={isUploaded ? "check-circle" : "error"} 
									size={16} 
									color={isUploaded ? '#16a34a' : '#dc2626'} 
								/>
								<Text className={`text-xs font-semibold ${isUploaded ? 'text-green-600' : 'text-red-600'}`}>
									{isUploaded ? 'Uploaded' : 'Not Uploaded'}
								</Text>
							</View>
							<View className="flex-row flex-shrink-0 ml-2">
								{isUploaded && !student.isRevoked && (
									<TouchableOpacity
										onPress={() => onShowImage(student)}
										className="px-2 py-1.5 rounded-md bg-blue-600 flex-row items-center mr-2"
									>
										<MaterialIcons name="photo" size={14} color="white" />
										<Text className="text-xs font-semibold text-white ml-1">
											View
										</Text>
									</TouchableOpacity>
								)}
								{!student.isRevoked && (
									<TouchableOpacity
										onPress={() => onRevoke(student)}
										className="px-2 py-1.5 rounded-md bg-red-100 flex-row items-center"
									>
										<MaterialIcons name="block" size={14} color="#dc2626" />
										<Text className="text-xs font-semibold text-red-600 ml-1">
											Revoke
										</Text>
									</TouchableOpacity>
								)}
							</View>
						</View>
						{isUploaded && student.uploadTime && (
							<Text className="text-xs text-gray-500 mt-1 text-right">
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
		<SafeAreaView className="flex-1 bg-gray-50">
			<View className="flex-1 bg-white">
				{/* Header */}
				<View className="flex-row items-center justify-between p-4 border-b border-gray-200">
					<TouchableOpacity
						onPress={onBack}
						className="p-2 rounded-full bg-gray-100"
					>
						<MaterialIcons name="arrow-back" size={24} color="#6b7280" />
					</TouchableOpacity>
					<View className="items-center">
						<Text className="text-xl font-bold text-gray-900">
							Proxy Review
						</Text>
						<Text className="text-sm font-medium text-gray-500">
							{session.title}
						</Text>
					</View>
					<View className="w-10 h-10" />
				</View>

				<ScrollView 
					className="flex-1"
					contentContainerClassName="pb-24"
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
				<View className="bg-white border-t border-gray-200 pt-2 pb-6 shadow-lg">
					<View className="flex-row justify-around items-center px-4">
						<TouchableOpacity className="flex-1 items-center justify-center py-2">
							<MaterialIcons name="home" size={24} color="#6b7280" />
							<Text className="text-xs font-medium text-gray-500 mt-1">
								Home
							</Text>
						</TouchableOpacity>
						<TouchableOpacity className="flex-1 items-center justify-center py-2 mx-2 bg-blue-50 rounded-xl px-4">
							<MaterialIcons name="checklist" size={24} color="#137fec" />
							<Text className="text-xs font-medium text-blue-600 mt-1">
								Attendance
							</Text>
						</TouchableOpacity>
						<TouchableOpacity className="flex-1 items-center justify-center py-2">
							<MaterialIcons name="person" size={24} color="#6b7280" />
							<Text className="text-xs font-medium text-gray-500 mt-1">
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
				<View className="flex-1 bg-black/85 justify-center items-center p-5">
					<View className="w-full max-w-[400px] bg-white rounded-3xl p-6 items-center shadow-xl">
						<View className="flex-row items-center gap-2 mb-5">
							<MaterialIcons name="photo-camera" size={24} color="#1f2937" />
							<Text className="text-xl font-bold text-gray-900">
								{selectedStudent?.name}&apos;s Photo
							</Text>
						</View>
						<View className="w-full aspect-[4/3] bg-gray-100 rounded-2xl justify-center items-center mb-6 border border-gray-200 overflow-hidden">
							<MaterialIcons name="image" size={64} color="#9ca3af" />
							<Text className="text-sm font-medium text-gray-500 mt-3">
								Photo Preview
							</Text>
						</View>
						<View className="flex-row gap-3 w-full">
							<TouchableOpacity
								onPress={() => setShowImageModal(false)}
								className="flex-1 py-3.5 px-5 rounded-xl bg-gray-100 flex-row items-center justify-center gap-2"
							>
								<MaterialIcons name="close" size={20} color="#6b7280" />
								<Text className="text-base font-semibold text-gray-500">
									Close
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => {
									setShowImageModal(false)
									handleRevoke(selectedStudent!)
								}}
								className="flex-1 py-3.5 px-5 rounded-xl bg-red-100 flex-row items-center justify-center gap-2"
							>
								<MaterialIcons name="block" size={20} color="#dc2626" />
								<Text className="text-base font-semibold text-red-600">
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
				<View className="flex-1 bg-black/85 justify-center items-center p-5">
					<View className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-xl">
						<View className="items-center mb-5">
							<View className="w-[72px] h-[72px] rounded-full bg-red-100 justify-center items-center mb-5 shadow-sm shadow-red-600">
								<MaterialIcons name="warning" size={36} color="#dc2626" />
							</View>
							<Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
								Revoke Attendance?
							</Text>
							<Text className="text-gray-500 text-center mb-2 text-base leading-6">
								Are you sure you want to revoke attendance for:
							</Text>
							<Text className="text-lg font-semibold text-gray-900 mb-4">
								{selectedStudent?.name}
							</Text>
							{selectedStudent?.aiDetection && (
								<View className="bg-amber-50 p-4 rounded-xl mb-4 w-full border border-amber-200">
									<View className="flex-row items-center gap-2 mb-2">
										<MaterialIcons name="auto-awesome" size={20} color="#92400e" />
										<Text className="text-amber-800 font-semibold text-base">
											AI Detection Result
										</Text>
									</View>
									<Text className="text-amber-800 text-[15px] leading-[22px]">
										{selectedStudent.aiDetection.reason}
									</Text>
								</View>
							)}
						</View>
						<View className="flex-row gap-3">
							<TouchableOpacity
								onPress={() => setShowRevokeModal(false)}
								className="flex-1 py-3.5 px-5 rounded-xl bg-gray-100 flex-row items-center justify-center gap-2"
							>
								<MaterialIcons name="close" size={20} color="#6b7280" />
								<Text className="text-base font-semibold text-gray-500">
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={confirmRevoke}
								className="flex-1 py-3.5 px-5 rounded-xl bg-red-600 flex-row items-center justify-center gap-2"
							>
								<MaterialIcons name="block" size={20} color="white" />
								<Text className="text-base font-semibold text-white">
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
