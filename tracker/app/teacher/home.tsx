import React, { useState } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import AttendanceScreen from './AttendanceScreen'
import PhotoUploadScreen from './PhotoUploadScreen'

type Session = {
	startEndTime: string
	title: string
	details: string
	imageUri: string
}

function SessionCard({ session, onStartAttendance }: { session: Session; onStartAttendance: (session: Session) => void }) {
	return (
		<View className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
			<View className="flex-row items-start justify-between gap-4">
				<View className="flex-1">
					<Text className="text-base font-medium text-gray-500">{session.startEndTime}</Text>
					<Text className="text-xl font-bold text-gray-800 mt-1">{session.title}</Text>
					<Text className="text-base text-gray-500">{session.details}</Text>
				</View>
				<Image
					source={{ uri: session.imageUri }}
					className="w-24 h-24 rounded-lg"
					resizeMode="cover"
				/>
			</View>
			<TouchableOpacity 
				className="flex w-full mt-4 items-center justify-center rounded-md h-12 px-4 bg-[#137fec]"
				onPress={() => onStartAttendance(session)}
			>
				<Text className="text-white text-base font-bold">Start Attendance</Text>
			</TouchableOpacity>
		</View>
	)
}

export default function TeacherAttendanceHome() {
	const [currentSession, setCurrentSession] = useState<Session | null>(null)
	const [showPhotoUpload, setShowPhotoUpload] = useState(false)
	
	const upcomingSessions: Session[] = [
		{
			startEndTime: '9:00 AM - 10:00 AM',
			title: 'Calculus 101',
			details: 'Class A / Batch 2024',
			imageUri:
				'https://lh3.googleusercontent.com/aida-public/AB6AXuAE-Nx2SEwmZUJ42XKUkBjO5OLvssS3yikEpncv7jTEkHHJcN3S1dD0iLZkdUFO7HzQp8errahWprB39G8GPu1ifCUDPMpBOy-JVOWRuPBj9YdpVygnG5pZPu1ONth1-Hy16v23eOJbaVH_ndGDVxQeKzaLBlkKqWNk1c_OQ-M8hDEuZSvfcwwMgFpZ6w15yiSbD18xk0TzvH_R1mPAMKk4Kuw2_dmS48jyTsRvaWPjoaprSWgJFZI6wTn1bOTUkdSNHhTuY6yr3Rs6',
		},
		{
			startEndTime: '11:00 AM - 12:00 PM',
			title: 'Physics 202',
			details: 'Class B / Batch 2025',
			imageUri:
				'https://lh3.googleusercontent.com/aida-public/AB6AXuAxtWIu0J6egu0_r8XpkDnSJHZo2Sjh6dfxJk2OleFj6lYjB_iNRahI3c_r8h9QN_4FvC2fjuuMMPSrBt6VWMFliDeYCBodlebQcyyv2iU91p9NBZqjpuxwnGyFkRDlMsStDb1njqz7yO4aVHjK6_y-lKEKvH2RuQGNDUwv8tMsoUCAfcHOkGK7Z4tUewbb4ULdOz6uLScjrfZfIt9LkbVjGJ9WMsQ1jOjuJT64lVbz4_U7NLMDrF_oM9-WOcrqCx5js9veJXVX6U6r',
		},
	]

	const handleStartAttendance = (session: Session) => {
		setCurrentSession(session)
		setShowPhotoUpload(true)
	}

	const handleBackToHome = () => {
		setCurrentSession(null)
		setShowPhotoUpload(false)
	}

	const handleBackFromPhotoUpload = () => {
		setShowPhotoUpload(false)
	}

	// If photo upload is shown, show the photo upload screen
	if (showPhotoUpload && currentSession) {
		return <PhotoUploadScreen session={currentSession} onBack={handleBackFromPhotoUpload} />
	}

	// If a session is selected, show the attendance screen
	if (currentSession) {
		return <AttendanceScreen session={currentSession} onBack={handleBackToHome} />
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<View className="flex-1 bg-white">
				<View className="bg-white">
					<View className="flex-row items-center justify-between p-4 pb-3">
						<Text className="text-2xl font-bold text-gray-900">Attendance</Text>
						<View className="relative">
							<TouchableOpacity className="p-2 rounded-full" accessibilityLabel="Notifications">
								<MaterialIcons name="notifications-none" size={24} color="#6b7280" />
							</TouchableOpacity>
							<View className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
						</View>
					</View>
				</View>

				<ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }}>
					<View className="space-y-6">
						<View className="px-4">
							<View className="flex-row items-center justify-between p-1 bg-gray-100 rounded-full">
								<TouchableOpacity className="w-1/2 px-4 py-2 rounded-full bg-white shadow-sm">
									<Text className="text-sm font-semibold text-gray-800 text-center">Today</Text>
								</TouchableOpacity>
								<TouchableOpacity className="w-1/2 px-4 py-2 rounded-full">
									<Text className="text-sm font-medium text-gray-500 text-center">Yesterday</Text>
								</TouchableOpacity>
							</View>
						</View>

						<View>
							<Text className="text-lg font-bold text-gray-900 mb-4 px-4">Upcoming</Text>
							<View className="gap-4 px-4">
								{upcomingSessions.map((s) => (
									<SessionCard key={s.title} session={s} onStartAttendance={handleStartAttendance} />
								))}
							</View>
						</View>

						<View>
							<Text className="text-lg font-bold text-gray-900 mb-4 px-4">Ended</Text>
							<View className="space-y-4 px-4">
								<View className="rounded-lg border border-gray-200 bg-white p-4">
									<View className="flex-row items-center justify-between mb-4">
										<View>
											<Text className="text-lg font-bold text-gray-800">Chemistry 101</Text>
											<Text className="text-sm text-gray-500">8:00 AM - 9:00 AM</Text>
										</View>
										<View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-green-100">
											<MaterialIcons name="check-circle" size={16} color="#15803d" />
											<Text className="text-sm font-medium text-green-700">Completed</Text>
										</View>
									</View>
									<View className="flex-row gap-4">
										<View className="flex-1 items-center justify-center gap-1 rounded-lg bg-gray-100 p-3">
											<Text className="text-sm font-medium text-gray-600">Total</Text>
											<Text className="text-2xl font-bold text-gray-900">30</Text>
										</View>
										<View className="flex-1 items-center justify-center gap-1 rounded-lg bg-green-100 p-3">
											<Text className="text-sm font-medium text-green-700">Present</Text>
											<Text className="text-2xl font-bold text-green-800">28</Text>
										</View>
										<View className="flex-1 items-center justify-center gap-1 rounded-lg bg-red-100 p-3">
											<Text className="text-sm font-medium text-red-700">Absent</Text>
											<Text className="text-2xl font-bold text-red-800">2</Text>
										</View>
									</View>
								</View>
							</View>
						</View>
					</View>
				</ScrollView>				
			</View>
		</SafeAreaView>
	)
}
