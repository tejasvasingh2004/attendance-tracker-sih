import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useGetAttendanceStats } from '../../hooks';

type Session = {
  id: string;
  startEndTime: string;
  title: string;
  details: string;
  imageUri: string;
};

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TeacherHomeProps = {
  navigation: NativeStackNavigationProp<any>;
};

function SessionCard({
  session,
  onStartAttendance,
}: {
  session: Session;
  onStartAttendance: (session: Session) => void;
}) {
  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, paddingRight: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#10b981',
                marginRight: 8,
              }}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {session.startEndTime}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: 8,
              lineHeight: 28,
            }}
          >
            {session.title}
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: '#64748b',
              fontWeight: '500',
            }}
          >
            {session.details}
          </Text>
        </View>
        <Image
          source={{ uri: session.imageUri }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: '#f1f5f9',
          }}
          resizeMode="cover"
        />
      </View>
      <TouchableOpacity
        onPress={() => onStartAttendance(session)}
        style={{
          backgroundColor: '#3b82f6',
          borderRadius: 12,
          paddingVertical: 16,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#3b82f6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text
          style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 0.5,
          }}
        >
          Start Attendance
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TeacherHome({ navigation }: TeacherHomeProps) {
  const [selectedTab, setSelectedTab] = useState<'today' | 'yesterday'>(
    'today',
  );

  const { data: stats, loading: statsLoading, execute: fetchStats } = useGetAttendanceStats();

  useEffect(() => {
    // Fetch stats for a hardcoded sessionId
    fetchStats('session-1');
  }, []);

  const onStartAttendance = (session: Session) => {
    navigation.navigate('AttendanceScreen', { session });
  };

  const handleTabChange = (tab: 'today' | 'yesterday') => {
    setSelectedTab(tab);
  };
  const upcomingSessions: Session[] = [
    {
      id: 'session-1',
      startEndTime: '9:00 AM - 10:00 AM',
      title: 'Calculus 101',
      details: 'Class A / Batch 2024',
      imageUri:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAE-Nx2SEwmZUJ42XKUkBjO5OLvssS3yikEpncv7jTEkHHJcN3S1dD0iLZkdUFO7HzQp8errahWprB39G8GPu1ifCUDPMpBOy-JVOWRuPBj9YdpVygnG5pZPu1ONth1-Hy16v23eOJbaVH_ndGDVxQeKzaLBlkKqWNk1c_OQ-M8hDEuZSvfcwwMgFpZ6w15yiSbD18xk0TzvH_R1mPAMKk4Kuw2_dmS48jyTsRvaWPjoaprSWgJFZI6wTn1bOTUkdSNHhTuY6yr3Rs6',
    },
    {
      id: 'session-2',
      startEndTime: '11:00 AM - 12:00 PM',
      title: 'Physics 202',
      details: 'Class B / Batch 2025',
      imageUri:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAxtWIu0J6egu0_r8XpkDnSJHZo2Sjh6dfxJk2OleFj6lYjB_iNRahI3c_r8h9QN_4FvC2fjuuMMPSrBt6VWMFliDeYCBodlebQcyyv2iU91p9NBZqjpuxwnGyFkRDlMsStDb1njqz7yO4aVHjK6_y-lKEKvH2RuQGNDUwv8tMsoUCAfcHOkGK7Z4tUewbb4ULdOz6uLScjrfZfIt9LkbVjGJ9WMsQ1jOjuJT64lVbz4_U7NLMDrF_oM9-WOcrqCx5js9veJXVX6U6r',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: '#e2e8f0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingVertical: 16,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: 4,
                }}
              >
                Attendance
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#64748b',
                  fontWeight: '500',
                }}
              >
                Manage your classes
              </Text>
            </View>
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#f1f5f9',
                }}
                accessibilityLabel="Notifications"
              >
                <MaterialIcons name="notifications" size={24} color="#475569" />
              </TouchableOpacity>
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  height: 8,
                  width: 8,
                  borderRadius: 4,
                  backgroundColor: '#ef4444',
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }}
              />
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 32 }}>
            {/* Tab Selector */}
            <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 12,
                  padding: 4,
                  position: 'relative',
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: selectedTab === 'today' ? 4 : '50%',
                    width: '50%',
                    height: 40,
                    backgroundColor: '#3b82f6',
                    borderRadius: 8,
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                />
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    zIndex: 1,
                  }}
                  onPress={() => handleTabChange('today')}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: selectedTab === 'today' ? '#ffffff' : '#64748b',
                      textAlign: 'center',
                    }}
                  >
                    Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    zIndex: 1,
                  }}
                  onPress={() => handleTabChange('yesterday')}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color:
                        selectedTab === 'yesterday' ? '#ffffff' : '#64748b',
                      textAlign: 'center',
                    }}
                  >
                    Yesterday
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Upcoming Sessions */}
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingHorizontal: 24,
                }}
              >
                <View
                  style={{
                    width: 4,
                    height: 24,
                    backgroundColor: '#3b82f6',
                    borderRadius: 2,
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#0f172a',
                  }}
                >
                  Upcoming Classes
                </Text>
              </View>
              <View style={{ gap: 20, paddingHorizontal: 24 }}>
                {upcomingSessions.map(s => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onStartAttendance={onStartAttendance}
                  />
                ))}
              </View>
            </View>

            {/* Completed Sessions */}
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingHorizontal: 24,
                }}
              >
                <View
                  style={{
                    width: 4,
                    height: 24,
                    backgroundColor: '#10b981',
                    borderRadius: 2,
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#0f172a',
                  }}
                >
                  Completed Classes
                </Text>
              </View>
              <View style={{ gap: 20, paddingHorizontal: 24 }}>
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 20,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: '800',
                          color: '#0f172a',
                          marginBottom: 4,
                        }}
                      >
                        Chemistry 101
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#64748b',
                          fontWeight: '500',
                        }}
                      >
                        8:00 AM - 9:00 AM
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: '#dcfce7',
                      }}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={16}
                        color="#15803d"
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#15803d',
                          marginLeft: 6,
                        }}
                      >
                        Completed
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: '#f8fafc',
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#e2e8f0',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#64748b',
                          marginBottom: 4,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        Total
                      </Text>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: '800',
                          color: '#0f172a',
                        }}
                      >
                        {stats?.statistics?.total || 30}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: '#dcfce7',
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#bbf7d0',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#15803d',
                          marginBottom: 4,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        Present
                      </Text>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: '800',
                          color: '#166534',
                        }}
                      >
                        {stats?.statistics?.present || 28}
                      </Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        backgroundColor: '#fee2e2',
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#fecaca',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#dc2626',
                          marginBottom: 4,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        Absent
                      </Text>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: '800',
                          color: '#b91c1c',
                        }}
                      >
                        {stats?.statistics?.absent || 2}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
