import * as React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Student } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AttendanceScreen'>;

function StudentCard({
  student,
  onRemove,
}: {
  student: Student;
  onRemove: (studentId: string) => void;
}) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{ uri: student.avatar }}
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
          resizeMode="cover"
        />
        <View>
          <Text style={{ fontWeight: '500', color: '#1f2937', fontSize: 16 }}>
            {student.name}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 14 }}>
            ID: {student.id}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 16,
            backgroundColor: '#dcfce7',
            marginRight: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#166534' }}>
            Present
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onRemove(student.id)}
          style={{ padding: 8, borderRadius: 6, backgroundColor: '#fee2e2' }}
        >
          <MaterialIcons name="close" size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const AttendanceScreen: React.FC<Props> = ({ route, navigation }) => {
  const { session } = route.params;
  const onBack = () => navigation.goBack();
  const [showBroadcasting, setShowBroadcasting] = React.useState(true);
  const [searchText, setSearchText] = React.useState('');
  const [visibleStudents, setVisibleStudents] = React.useState<Student[]>([]);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
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
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
    };
  }, [pulseAnim]);

  const filteredStudents = visibleStudents.filter(
    student =>
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.id.includes(searchText),
  );

  const handleRemoveStudent = (studentId: string) => {
    setVisibleStudents(prev =>
      prev.filter(student => student.id !== studentId),
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
          }}
        >
          <TouchableOpacity
            style={{ padding: 8, borderRadius: 20 }}
            onPress={onBack}
          >
            <MaterialIcons name="arrow-back" size={24} color="#4b5563" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}
            >
              {session.title}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#6b7280' }}>
              {session.details}
            </Text>
          </View>
          <View style={{ width: 40, height: 40 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
        >
          <View style={{ padding: 16, paddingTop: 32, paddingBottom: 16 }}>
            {showBroadcasting && (
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 32,
                  marginBottom: 24,
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    position: 'relative',
                    width: 120,
                    height: 120,
                    marginBottom: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      backgroundColor: '#dbeafe',
                      opacity: pulseAnim,
                    }}
                  />
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: 90,
                      height: 90,
                      borderRadius: 45,
                      backgroundColor: '#bfdbfe',
                      opacity: pulseAnim,
                    }}
                  />
                  <View style={{ position: 'relative', zIndex: 10 }}>
                    <MaterialIcons
                      name="wifi-tethering"
                      size={48}
                      color="#137fec"
                    />
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: '#111827',
                    marginBottom: 8,
                    textAlign: 'center',
                  }}
                >
                  Scanning for Students
                </Text>
                <Text
                  style={{
                    color: '#6b7280',
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                >
                  Scanning for nearby devices. Please wait...
                </Text>
              </View>
            )}

            {/* Search Bar */}
            <View style={{ position: 'relative' }}>
              <MaterialIcons
                name="search"
                size={20}
                color="#9ca3af"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  marginTop: -10,
                  zIndex: 1,
                }}
              />
              <TextInput
                style={{
                  width: '100%',
                  paddingLeft: 40,
                  paddingRight: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  backgroundColor: 'white',
                }}
                placeholder="Search students..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Students */}
            <View style={{ marginTop: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#1f2937',
                    }}
                  >
                    Students Present ({visibleStudents.length})
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}
                  >
                    Current: {visibleStudents.length}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#10b981',
                      marginRight: 6,
                    }}
                  />
                  <Text style={{ color: '#6b7280', fontSize: 14 }}>
                    Present ({visibleStudents.length})
                  </Text>
                </View>
              </View>

              {filteredStudents.map(student => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onRemove={handleRemoveStudent}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Stop Attendance Button */}
        <View
          style={{
            padding: 16,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#ef4444',
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => {
              // TODO: Implement stop attendance logic
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
              Stop Attendance
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AttendanceScreen;
