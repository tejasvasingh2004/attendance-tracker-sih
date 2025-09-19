import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

type Session = {
  startEndTime: string
  title: string
  details: string
  imageUri: string
}

export interface TeacherHomeProps {
  onStartAttendance: (session: Session) => void
}

function SessionCard({ session, onStartAttendance }: { session: Session; onStartAttendance: (session: Session) => void }) {
  return (
    <View style={{ backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>{session.startEndTime}</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#1f2937', marginTop: 4 }}>{session.title}</Text>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>{session.details}</Text>
        </View>
        <Image source={{ uri: session.imageUri }} style={{ width: 96, height: 96, borderRadius: 12 }} resizeMode="cover" />
      </View>
      <TouchableOpacity onPress={() => onStartAttendance(session)} style={{ marginTop: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 8, height: 48, backgroundColor: '#137fec' }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Start Attendance</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function TeacherHome({ onStartAttendance }: TeacherHomeProps) {
  const upcomingSessions: Session[] = [
    {
      startEndTime: '9:00 AM - 10:00 AM',
      title: 'Calculus 101',
      details: 'Class A / Batch 2024',
      imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE-Nx2SEwmZUJ42XKUkBjO5OLvssS3yikEpncv7jTEkHHJcN3S1dD0iLZkdUFO7HzQp8errahWprB39G8GPu1ifCUDPMpBOy-JVOWRuPBj9YdpVygnG5pZPu1ONth1-Hy16v23eOJbaVH_ndGDVxQeKzaLBlkKqWNk1c_OQ-M8hDEuZSvfcwwMgFpZ6w15yiSbD18xk0TzvH_R1mPAMKk4Kuw2_dmS48jyTsRvaWPjoaprSWgJFZI6wTn1bOTUkdSNHhTuY6yr3Rs6'
    },
    {
      startEndTime: '11:00 AM - 12:00 PM',
      title: 'Physics 202',
      details: 'Class B / Batch 2025',
      imageUri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxtWIu0J6egu0_r8XpkDnSJHZo2Sjh6dfxJk2OleFj6lYjB_iNRahI3c_r8h9QN_4FvC2fjuuMMPSrBt6VWMFliDeYCBodlebQcyyv2iU91p9NBZqjpuxwnGyFkRDlMsStDb1njqz7yO4aVHjK6_y-lKEKvH2RuQGNDUwv8tMsoUCAfcHOkGK7Z4tUewbb4ULdOz6uLScjrfZfIt9LkbVjGJ9WMsQ1jOjuJT64lVbz4_U7NLMDrF_oM9-WOcrqCx5js9veJXVX6U6r'
    }
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827' }}>Attendance</Text>
            <View>
              <TouchableOpacity style={{ padding: 8, borderRadius: 9999 }} accessibilityLabel="Notifications">
                <MaterialIcons name="notifications" size={24} color="#6b7280" />
              </TouchableOpacity>
              <View style={{ position: 'absolute', top: 4, right: 4, height: 10, width: 10, borderRadius: 9999, backgroundColor: '#ef4444', borderWidth: 2, borderColor: 'white' }} />
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 96 }}>
          <View style={{ gap: 24 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 4, backgroundColor: '#f3f4f6', borderRadius: 9999 }}>
                <TouchableOpacity style={{ width: '50%', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999, backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1f2937', textAlign: 'center' }}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '50%', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9999 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>Yesterday</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16, paddingHorizontal: 16 }}>Upcoming</Text>
              <View style={{ gap: 16, paddingHorizontal: 16 }}>
                {upcomingSessions.map((s) => (
                  <SessionCard key={s.title} session={s} onStartAttendance={onStartAttendance} />
                ))}
              </View>
            </View>

            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16, paddingHorizontal: 16 }}>Ended</Text>
              <View style={{ gap: 16, paddingHorizontal: 16 }}>
                <View style={{ borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white', padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#1f2937' }}>Chemistry 101</Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>8:00 AM - 9:00 AM</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 9999, backgroundColor: '#dcfce7' }}>
                      <MaterialIcons name="check-circle" size={16} color="#15803d" />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#16a34a' }}>Completed</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 12, backgroundColor: '#f3f4f6', padding: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#4b5563' }}>Total</Text>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827' }}>30</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 12, backgroundColor: '#dcfce7', padding: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#15803d' }}>Present</Text>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: '#166534' }}>28</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 12, backgroundColor: '#fee2e2', padding: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#dc2626' }}>Absent</Text>
                      <Text style={{ fontSize: 24, fontWeight: '800', color: '#b91c1c' }}>2</Text>
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


