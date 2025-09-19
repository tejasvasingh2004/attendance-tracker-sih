import * as React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, TextInput, Animated } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import ProxyAlertModal from './components/ProxyAlertModal'
import ProxyReviewScreen from './ProxyReviewScreen'

type Student = {
    id: string
    name: string
    avatar: string
}

const PRESENT_STUDENTS: Student[] = [
    { id: '12345', name: 'Aisha', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6lAu2dwzz-euQ8r7bJdu_1jcKYlHECdJSsc73vRdBwdHl-txCqh9LtFN5PsjPKUb73qNZyBAtqYHNu_2OCDH6CW0iueA08O_jrdLy97SMzoaR66YxCY-Y0WFKwrSv4E4XpaGzr-_mLQ9GdYuyL49_NfNJakp3bdJJ4gHabnz3LN6Z7SxOGIS57tyKFYlLEHYPVPE7PxdNspSa2cuO-vKv8MbIagbnsN4O2r-K7dVg19xpSv4qX-zbTmHW1P-_WIQNkCSoBFabtZbV' },
    { id: '12347', name: 'Aarav', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYpQ6mQo-qYbZ24NgbsC40ph9cpoCExU_dm6PVaOZkjIXfw5s0J2aa8Hc3XzcU27I852L97E8-H-3I9Srguzodf8qmnkHzdPI5lQWml_9vYYWl-sz-EoUrCVROoBWoWnV9EPi4BZB_1wMvF198B9-8kYK9rjwaZXI3PSbx86A5TAwWvP6c5ZXRNnH4ZkivnosRGq0Xm9gQGu8kIl9YPr-8ewb21vw4-zgEdyIPA7bIehPZ6uavxGKScJvUeagjeaCZ3JlLptEdO_KK' },
    { id: '12349', name: 'Vihaan', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT32ITd0o5gGkuUQcNwFS6JJxbdu1tqQeEGhhYqgJCtuvM4gmUsvFOKa8YO-2SWL17pgPAO0_dzQPFccFO5ngHbmEQ3vlrqOn69jWvd8V8isP6JYJLB-wsOZ58fb1dcqzGLJW9firFh4SKJyTNSq-V6lcwaDip8YiVk7xnU4VuO7-6JoMwjaO2v6Ad8j8VcFMN_hNb3hKqOqxq3yF_yGvbgB_Ri7YVQ0bwJReTyc7J1zTMe3KBbcEgs3G4Phmz8t6dfRGPJc4OSXr3' },
    { id: '12351', name: 'Sahil', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVvIpAyzAmZe3IJyzPGGAh9wKs1rn_DvlUWzbcL_Rr8z-S674znoUdg2Z3-_BiG0Azl3mkmoGm9WYd652KvL7mlWVYi3Bi3i6Tti5ye1pXh63VHzumrqCzmB_KobUFD5YtAuZZLXbBSWOyX8NZQQcPbBGno3fJ1h5konUsutidpIukEoa0IEauLvFCTyyqb_UBXL_jE7mdJmByfCrKwwZ5X50rQ5r5KNKgeh6zdWrF9cMDY__gGe1pHbCi9DeSJWv1OLIGpKNKOEp_' },
    { id: '12353', name: 'Advait', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbAMwrsp_vMpBxoc2WWirf3ScRPclZhsggapVZ9izsHZM_2odk3SAsrnV9nxQHZy2NALDTqeUYqy2AB0Vxj2Z_JKiEvXJbmDrG5YP6fAyKFvBD8tySQ359pf7CzSqewyMPOSYRKFm8yKuIVC42nkldP65SN_Am74pUoCCb__V4XFmB265Qhp4fokivVgPCRsDKqAGGbO2v3ji0JfEJ6d_EUzou9N2l3ef8RJh99mPuimrNz9_qsWV1wdrKgeJYuWl0lyjkG2ngy3Ud' },
    { id: '12355', name: 'Ishaan', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6lAu2dwzz-euQ8r7bJdu_1jcKYlHECdJSsc73vRdBwdHl-txCqh9LtFN5PsjPKUb73qNZyBAtqYHNu_2OCDH6CW0iueA08O_jrdLy97SMzoaR66YxCY-Y0WFKwrSv4E4XpaGzr-_mLQ9GdYuyL49_NfNJakp3bdJJ4gHabnz3LN6Z7SxOGIS57tyKFYlLEHYPVPE7PxdNspSa2cuO-vKv8MbIagbnsN4O2r-K7dVg19xpSv4qX-zbTmHW1P-_WIQNkCSoBFabtZbV' },
    { id: '12357', name: 'Riya', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYpQ6mQo-qYbZ24NgbsC40ph9cpoCExU_dm6PVaOZkjIXfw5s0J2aa8Hc3XzcU27I852L97E8-H-3I9Srguzodf8qmnkHzdPI5lQWml_9vYYWl-sz-EoUrCVROoBWoWnV9EPi4BZB_1wMvF198B9-8kYK9rjwaZXI3PSbx86A5TAwWvP6c5ZXRNnH4ZkivnosRGq0Xm9gQGu8kIl9YPr-8ewb21vw4-zgEdyIPA7bIehPZ6uavxGKScJvUeagjeaCZ3JlLptEdO_KK' },
    { id: '12358', name: 'Kabir', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT32ITd0o5gGkuUQcNwFS6JJxbdu1tqQeEGhhYqgJCtuvM4gmUsvFOKa8YO-2SWL17pgPAO0_dzQPFccFO5ngHbmEQ3vlrqOn69jWvd8V8isP6JYJLB-wsOZ58fb1dcqzGLJW9firFh4SKJyTNSq-V6lcwaDip8YiVk7xnU4VuO7-6JoMwjaO2v6Ad8j8VcFMN_hNb3hKqOqxq3yF_yGvbgB_Ri7YVQ0bwJReTyc7J1zTMe3KBbcEgs3G4Phmz8t6dfRGPJc4OSXr3' },
    { id: '12359', name: 'Ananya', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVvIpAyzAmZe3IJyzPGGAh9wKs1rn_DvlUWzbcL_Rr8z-S674znoUdg2Z3-_BiG0Azl3mkmoGm9WYd652KvL7mlWVYi3Bi3i6Tti5ye1pXh63VHzumrqCzmB_KobUFD5YtAuZZLXbBSWOyX8NZQQcPbBGno3fJ1h5konUsutidpIukEoa0IEauLvFCTyyqb_UBXL_jE7mdJmByfCrKwwZ5X50rQ5r5KNKgeh6zdWrF9cMDY__gGe1pHbCi9DeSJWv1OLIGpKNKOEp_' },
    { id: '12360', name: 'Dev', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbAMwrsp_vMpBxoc2WWirf3ScRPclZhsggapVZ9izsHZM_2odk3SAsrnV9nxQHZy2NALDTqeUYqy2AB0Vxj2Z_JKiEvXJbmDrG5YP6fAyKFvBD8tySQ359pf7CzSqewyMPOSYRKFm8yKuIVC42nkldP65SN_Am74pUoCCb__V4XFmB265Qhp4fokivVgPCRsDKqAGGbO2v3ji0JfEJ6d_EUzou9N2l3ef8RJh99mPuimrNz9_qsWV1wdrKgeJYuWl0lyjkG2ngy3Ud' },
    { id: '12361', name: 'Divy', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6lAu2dwzz-euQ8r7bJdu_1jcKYlHECdJSsc73vRdBwdHl-txCqh9LtFN5PsjPKUb73qNZyBAtqYHNu_2OCDH6CW0iueA08O_jrdLy97SMzoaR66YxCY-Y0WFKwrSv4E4XpaGzr-_mLQ9GdYuyL49_NfNJakp3bdJJ4gHabnz3LN6Z7SxOGIS57tyKFYlLEHYPVPE7PxdNspSa2cuO-vKv8MbIagbnsN4O2r-K7dVg19xpSv4qX-zbTmHW1P-_WIQNkCSoBFabtZbV' },
    { id: '12362', name: 'Sudhanshu', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYpQ6mQo-qYbZ24NgbsC40ph9cpoCExU_dm6PVaOZkjIXfw5s0J2aa8Hc3XzcU27I852L97E8-H-3I9Srguzodf8qmnkHzdPI5lQWml_9vYYWl-sz-EoUrCVROoBWoWnV9EPi4BZB_1wMvF198B9-8kYK9rjwaZXI3PSbx86A5TAwWvP6c5ZXRNnH4ZkivnosRGq0Xm9gQGu8kIl9YPr-8ewb21vw4-zgEdyIPA7bIehPZ6uavxGKScJvUeagjeaCZ3JlLptEdO_KK' },
]

const EXPECTED_HEADCOUNT = 10

function StudentCard({ student, onRemove }: { student: Student; onRemove: (studentId: string) => void }) {
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const slideAnim = React.useRef(new Animated.Value(50)).current

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start()
    }, [fadeAnim, slideAnim])

    return (
        <Animated.View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white',
            borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, opacity: fadeAnim, transform: [{ translateY: slideAnim }]
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Image source={{ uri: student.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} resizeMode="cover" />
                <View>
                    <Text style={{ fontWeight: '500', color: '#1f2937', fontSize: 16 }}>{student.name}</Text>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>ID: {student.id}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, backgroundColor: '#dcfce7' }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#166534' }}>Present</Text>
                </View>
                <TouchableOpacity onPress={() => onRemove(student.id)} style={{ padding: 8, borderRadius: 6, backgroundColor: '#fee2e2' }}>
                    <MaterialIcons name="close" size={16} color="#dc2626" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}

interface AttendanceScreenProps {
    session: {
        startEndTime: string
        title: string
        details: string
        imageUri: string
    }
    onBack: () => void
    onTakeProxyAction?: () => void
}

export default function AttendanceScreen({ session, onBack, onTakeProxyAction }: AttendanceScreenProps) {
    const [showBroadcasting, setShowBroadcasting] = React.useState(true)
    const [showProxyAlert, setShowProxyAlert] = React.useState(false)
    const [showProxyReview, setShowProxyReview] = React.useState(false)
    const [searchText, setSearchText] = React.useState('')
    const [visibleStudents, setVisibleStudents] = React.useState<Student[]>([])
    const pulseAnim = React.useRef(new Animated.Value(1)).current

    React.useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        )
        pulse.start()

        const addStudentWithDelay = (student: Student, delay: number) => {
            setTimeout(() => {
                setVisibleStudents(prev => {
                    const newStudents = [...prev, student]
                    if (newStudents.length > EXPECTED_HEADCOUNT) {
                        setShowBroadcasting(false)
                        setShowProxyAlert(true)
                    }
                    return newStudents
                })
            }, delay)
        }

        PRESENT_STUDENTS.forEach((student, index) => {
            const delay = 2000 + (index * 3000) + Math.random() * 2000
            addStudentWithDelay(student, delay)
        })

        const timer = setTimeout(() => { setShowBroadcasting(false) }, 20000)

        return () => { clearTimeout(timer); pulse.stop() }
    }, [pulseAnim])

    const filteredStudents = visibleStudents.filter(student =>
        student.name.toLowerCase().includes(searchText.toLowerCase()) || student.id.includes(searchText)
    )

    const handleRemoveStudent = (studentId: string) => {
        setVisibleStudents(prev => prev.filter(student => student.id !== studentId))
    }

    const handleTakeAction = () => {
        setShowProxyAlert(false)
        if (onTakeProxyAction) {
            onTakeProxyAction()
        } else {
            setShowProxyReview(true)
        }
    }

    const handleBackFromProxyReview = () => {
        setShowProxyReview(false)
    }

    if (showProxyReview) {
        return <ProxyReviewScreen session={session} onBack={handleBackFromProxyReview} />
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                    <TouchableOpacity style={{ padding: 8, borderRadius: 20 }} onPress={onBack}>
                        <MaterialIcons name="arrow-back" size={24} color="#4b5563" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{session.title}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>{session.details}</Text>
                    </View>
                    <View style={{ width: 40, height: 40 }} />
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 96 }}>
                    <View style={{ padding: 16, paddingTop: 32, paddingBottom: 16 }}>
                        {showBroadcasting && (
                            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 32, marginBottom: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                                <View style={{ position: 'relative', width: 120, height: 120, marginBottom: 24, justifyContent: 'center', alignItems: 'center' }}>
                                    <Animated.View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#dbeafe', opacity: pulseAnim }} />
                                    <Animated.View style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: '#bfdbfe', opacity: pulseAnim }} />
                                    <View style={{ position: 'relative', zIndex: 10 }}>
                                        <MaterialIcons name="wifi-tethering" size={48} color="#137fec" />
                                    </View>
                                </View>
                                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' }}>Broadcasting Signal</Text>
                <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 16 }}>Scanning for nearby devices. Please wait...</Text>
                            </View>
                        )}

                        <View style={{ position: 'relative' }}>
                            <MaterialIcons name="search" size={20} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', marginTop: -10, zIndex: 1 }} />
                            <TextInput
                                style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, fontSize: 16, backgroundColor: 'white' }}
                                placeholder="Search students..."
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <View style={{ marginTop: 24 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>Students Present ({visibleStudents.length})</Text>
                                    <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                                        Expected: {EXPECTED_HEADCOUNT} | Current: {visibleStudents.length}
                                        {visibleStudents.length > EXPECTED_HEADCOUNT && (
                                            <Text style={{ color: '#ef4444', fontWeight: '500' }}> ⚠️ Proxy Alert</Text>
                                        )}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' }} />
                                    <Text style={{ color: '#6b7280', fontSize: 14 }}>Present ({visibleStudents.length})</Text>
                                </View>
                            </View>

                            {filteredStudents.map((student) => (
                                <StudentCard key={student.id} student={student} onRemove={handleRemoveStudent} />
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>

            <ProxyAlertModal
                visible={showProxyAlert}
                onClose={() => setShowProxyAlert(false)}
                onTakeAction={handleTakeAction}
                expectedHeadcount={EXPECTED_HEADCOUNT}
                currentAttendance={visibleStudents.length}
            />
        </SafeAreaView>
    )
}


