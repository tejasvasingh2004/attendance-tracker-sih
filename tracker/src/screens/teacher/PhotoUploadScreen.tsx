import * as React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, Animated, Alert } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { launchCamera, launchImageLibrary, ImageLibraryOptions, CameraOptions } from 'react-native-image-picker'
import AttendanceScreen from './AttendanceScreen'

type Session = {
  startEndTime: string
  title: string
  details: string
  imageUri: string
}

interface PhotoUploadScreenProps {
  session: Session
  onBack: () => void
  onGoToProxyReview?: () => void
}

export default function PhotoUploadScreen({ session, onBack }: PhotoUploadScreenProps) {
  const [classroomImage, setClassroomImage] = React.useState<string | null>(null)
  const [showAttendance, setShowAttendance] = React.useState(false)
  const [detectedHeadcount, setDetectedHeadcount] = React.useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current
  const pulseAnim = React.useRef(new Animated.Value(1)).current
  const analyzeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start()
  }, [fadeAnim, slideAnim])

  React.useEffect(() => {
    if (classroomImage) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.95, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      )
      pulse.start()

      setIsAnalyzing(true)
      Animated.loop(
        Animated.sequence([
          Animated.timing(analyzeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(analyzeAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start()

      setTimeout(() => {
        setIsAnalyzing(false)
        setDetectedHeadcount(10)
      }, 3000)

      return () => {
        pulse.stop()
        setIsAnalyzing(false)
        setDetectedHeadcount(null)
      }
    }
  }, [classroomImage, pulseAnim, analyzeAnim])

  const handleTakePhoto = async () => {
    const options: CameraOptions = { mediaType: 'photo', includeBase64: false, quality: 0.8, cameraType: 'back' }
    const result = await launchCamera(options)
    if (result.didCancel) return
    const uri = result.assets && result.assets[0]?.uri
    if (uri) setClassroomImage(uri)
  }

  const handleUploadPhoto = async () => {
    const options: ImageLibraryOptions = { mediaType: 'photo', selectionLimit: 1, quality: 0.8 }
    const result = await launchImageLibrary(options)
    if (result.didCancel) return
    const uri = result.assets && result.assets[0]?.uri
    if (uri) setClassroomImage(uri)
  }

  const handleBroadcastSignal = () => {
    if (!classroomImage) {
      Alert.alert('Photo Required', 'Please add a classroom photo before starting attendance.')
      return
    }
    if (isAnalyzing) {
      Alert.alert('Please Wait', 'Still analyzing the classroom image...')
      return
    }
    setShowAttendance(true)
  }

  const handleBackFromAttendance = () => { setShowAttendance(false) }

  if (showAttendance) {
    return <AttendanceScreen session={session} onBack={handleBackFromAttendance} />
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Animated.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity style={{ padding: 8, borderRadius: 20 }} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#4b5563" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{session.title}</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>{session.details}</Text>
          </View>
          <View style={{ width: 40, height: 40 }} />
        </Animated.View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 96 }}>
          <View style={{ padding: 16, paddingTop: 32, paddingBottom: 16 }}>
            <Animated.View style={{ backgroundColor: '#f3f4f6', borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 12, padding: 24, alignItems: 'center', marginBottom: 32, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {classroomImage ? (
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <View style={{ width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                    <Image source={{ uri: classroomImage }} style={{ width: '100%', height: 200, borderRadius: 8 }} resizeMode="cover" />
                  </View>
                  {isAnalyzing ? (
                    <Animated.View style={{ marginTop: 16, opacity: analyzeAnim, alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialIcons name="auto-awesome" size={20} color="#137fec" />
                        <Text style={{ color: '#137fec', fontWeight: '500' }}>Analyzing classroom image...</Text>
                      </View>
                    </Animated.View>
                  ) : detectedHeadcount ? (
                    <View style={{ marginTop: 16, backgroundColor: '#f0fdf4', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0', width: '100%' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <MaterialIcons name="check-circle" size={20} color="#16a34a" />
                        <Text style={{ color: '#16a34a', fontWeight: '600' }}>Analysis Complete</Text>
                      </View>
                      <Text style={{ color: '#374151', marginTop: 4 }}>Detected <Text style={{ fontWeight: '600' }}>{detectedHeadcount}</Text> students in the classroom</Text>
                    </View>
                  ) : null}
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                    <TouchableOpacity onPress={() => setClassroomImage(null)} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fee2e2', borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name="close" size={18} color="#dc2626" />
                      <Text style={{ color: '#dc2626', fontWeight: '500' }}>Remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleTakePhoto} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f3f4f6', borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons name="refresh" size={18} color="#4b5563" />
                      <Text style={{ color: '#4b5563', fontWeight: '500' }}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 16 }}>
                  <MaterialIcons name="add-photo-alternate" size={64} color="#9ca3af" />
                  <View style={{ alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', textAlign: 'center' }}>Add a picture of your classroom</Text>
                    <Text style={{ color: '#6b7280', fontSize: 14, textAlign: 'center', maxWidth: 300 }}>Take a clear photo of your classroom to help verify attendance and detect the number of students present.</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                    <TouchableOpacity onPress={handleTakePhoto} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#137fec', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
                      <MaterialIcons name="photo-camera" size={20} color="white" />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleUploadPhoto} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 }}>
                      <MaterialIcons name="upload" size={20} color="#4b5563" />
                      <Text style={{ fontSize: 16, fontWeight: '500', color: '#4b5563' }}>Upload</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>

            {classroomImage && !isAnalyzing && detectedHeadcount && (
              <Animated.View style={{ alignItems: 'center', opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8, textAlign: 'center' }}>Ready to start taking attendance</Text>
                <Animated.View style={{ width: '100%', transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity onPress={handleBroadcastSignal} style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, paddingHorizontal: 16, backgroundColor: '#137fec', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                    <MaterialIcons name="wifi-tethering" size={24} color="white" />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Start Attendance</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            )}
          </View>
        </ScrollView>

        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e7eb', height: 80, flexDirection: 'row', justifyContent: 'space-around' }}>
          <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="home" size={28} color="#6b7280" />
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' }}>
            <MaterialIcons name="checklist" size={28} color="#137fec" />
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#137fec', marginTop: 4 }}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="person" size={28} color="#6b7280" />
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginTop: 4 }}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}


