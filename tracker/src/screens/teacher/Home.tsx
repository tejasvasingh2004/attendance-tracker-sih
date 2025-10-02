// screens/TeacherHome.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SessionCard, { Session } from '../../components/teacher/SessionCard';
import { useAuth } from '../../hooks/useAuth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fontSize } from '../../utils/scale';

type TeacherHomeProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function TeacherHome({ navigation }: TeacherHomeProps) {
  const { logout } = useAuth();

  const onStartAttendance = (session: Session) => {
    navigation.navigate('AttendanceScreen', { session });
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'AuthScreen' }],
    });
  };

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
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                Attendance
              </Text>
              <Text
                style={styles.subtitle}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Manage your classes
              </Text>
            </View>

            <View style={styles.headerActions}>
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={styles.iconWrap}
                  accessibilityLabel="Notifications"
                >
                  <MaterialIcons
                    name="notifications"
                    size={20}
                    color="#475569"
                  />
                </TouchableOpacity>
                <View style={styles.notifyDot} />
              </View>

              <TouchableOpacity
                style={styles.iconWrap}
                onPress={handleLogout}
                accessibilityLabel="Logout"
              >
                <MaterialIcons name="logout" size={20} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 32 }}>
            <View style={{ paddingTop: 20 }}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionMarker} />
                <Text style={styles.sectionTitle}>Upcoming Classes</Text>
              </View>
              <View style={{ gap: 20, paddingHorizontal: 24 }}>
                {upcomingSessions.map(s => (
                  <SessionCard
                    key={s.title}
                    session={s}
                    onStartAttendance={onStartAttendance}
                  />
                ))}
              </View>
            </View>

            {/* Completed Sessions */}
            <View>
              <View style={styles.sectionHeader}>
                <View
                  style={[styles.sectionMarker, { backgroundColor: '#10b981' }]}
                />
                <Text style={styles.sectionTitle}>Completed Classes</Text>
              </View>

              <View style={{ gap: 20, paddingHorizontal: 24 }}>
                {/* Example completed card — keep layout responsive */}
                <View style={styles.completedCard}>
                  <View style={styles.completedTop}>
                    <View>
                      <Text
                        style={styles.completedTitle}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        Chemistry 101
                      </Text>
                      <Text
                        style={styles.completedMeta}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        8:00 AM - 9:00 AM
                      </Text>
                    </View>
                    <View style={styles.completedBadge}>
                      <MaterialIcons
                        name="check-circle"
                        size={16}
                        color="#15803d"
                      />
                      <Text style={styles.completedBadgeText}>Completed</Text>
                    </View>
                  </View>

                  <View style={styles.completedStatsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Total</Text>
                      <Text style={styles.statValue}>30</Text>
                    </View>
                    <View style={[styles.statBox, styles.presentBox]}>
                      <Text style={styles.statLabelPresent}>Present</Text>
                      <Text style={[styles.statValue, { color: '#166534' }]}>
                        28
                      </Text>
                    </View>
                    <View style={[styles.statBox, styles.absentBox]}>
                      <Text style={styles.statLabelAbsent}>Absent</Text>
                      <Text style={[styles.statValue, { color: '#b91c1c' }]}>
                        2
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  title: {
    fontSize: fontSize(20), // reduced
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: fontSize(13),
    color: '#64748b',
    fontWeight: '500',
  },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconWrap: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginLeft: 8,
  },
  notifyDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  tabWrap: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    height: 48,
  },
  tabSlider: {
    position: 'absolute',
    top: 4,
    width: '50%',
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: fontSize(14),
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  tabTextActive: { color: '#fff' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionMarker: {
    width: 4,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: { fontSize: fontSize(18), fontWeight: '800', color: '#0f172a' },
  completedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  completedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: fontSize(16),
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  completedMeta: {
    fontSize: fontSize(13),
    color: '#64748b',
    fontWeight: '500',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
  },
  completedBadgeText: {
    fontSize: fontSize(12),
    fontWeight: '600',
    color: '#15803d',
    marginLeft: 6,
  },
  completedStatsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  presentBox: { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' },
  absentBox: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
  statLabel: {
    fontSize: fontSize(12),
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabelPresent: {
    fontSize: fontSize(12),
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabelAbsent: {
    fontSize: fontSize(12),
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: { fontSize: fontSize(20), fontWeight: '800', color: '#0f172a' },
});
