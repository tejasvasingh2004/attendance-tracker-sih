import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

const TeacherDashboard = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Attendance</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.icon}>notifications</Text>
              <View style={styles.badge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity style={styles.toggleActive}>
            <Text style={styles.toggleTextActive}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleInactive}>
            <Text style={styles.toggleTextInactive}>Yesterday</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming */}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text style={styles.time}>9:00 AM - 10:00 AM</Text>
                <Text style={styles.subject}>Calculus 101</Text>
                <Text style={styles.classInfo}>Class A / Batch 2024</Text>
              </View>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE-Nx2SEwmZUJ42XKUkBjO5OLvssS3yikEpncv7jTEkHHJcN3S1dD0iLZkdUFO7HzQp8errahWprB39G8GPu1ifCUDPMpBOy-JVOWRuPBj9YdpVygnG5pZPu1ONth1-Hy16v23eOJbaVH_ndGDVxQeKzaLBlkKqWNk1c_OQ-M8hDEuZSvfcwwMgFpZ6w15yiSbD18xk0TzvH_R1mPAMKk4Kuw2_dmS48jyTsRvaWPjoaprSWgJFZI6wTn1bOTUkdSNHhTuY6yr3Rs6' }}
                style={styles.image}
              />
            </View>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Start Attendance</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text style={styles.time}>11:00 AM - 12:00 PM</Text>
                <Text style={styles.subject}>Physics 202</Text>
                <Text style={styles.classInfo}>Class B / Batch 2025</Text>
              </View>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxtWIu0J6egu0_r8XpkDnSJHZo2Sjh6dfxJk2OleFj6lYjB_iNRahI3c_r8h9QN_4FvC2fjuuMMPSrBt6VWMFliDeYCBodlebQcyyv2iU91p9NBZqjpuxwnGyFkRDlMsStDb1njqz7yO4aVHjK6_y-lKEKvH2RuQGNDUwv8tMsoUCAfcHOkGK7Z4tUewbb4ULdOz6uLScjrfZfIt9LkbVjGJ9WMsQ1jOjuJT64lVbz4_U7NLMDrF_oM9-WOcrqCx5js9veJXVX6U6r' }}
                style={styles.image}
              />
            </View>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Start Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ended */}
        <Text style={styles.sectionTitle}>Ended</Text>
        <View style={styles.section}>
          <View style={styles.endedCard}>
            <View style={styles.endedHeader}>
              <View>
                <Text style={styles.endedSubject}>Chemistry 101</Text>
                <Text style={styles.endedTime}>8:00 AM - 9:00 AM</Text>
              </View>
              <View style={styles.status}>
                <Text style={styles.statusIcon}>✓</Text>
                <Text style={styles.statusText}>Completed</Text>
              </View>
            </View>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>30</Text>
              </View>
              <View style={styles.statPresent}>
                <Text style={styles.statLabelPresent}>Present</Text>
                <Text style={styles.statValuePresent}>28</Text>
              </View>
              <View style={styles.statAbsent}>
                <Text style={styles.statLabelAbsent}>Absent</Text>
                <Text style={styles.statValueAbsent}>2</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>home</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <Text style={styles.navIconActive}>checklist</Text>
          <Text style={styles.navTextActive}>Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>person</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    paddingBottom: 80, // Space for bottom nav
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerRight: {
    position: 'relative',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
  icon: {
    fontSize: 24,
    color: '#6b7280',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
    padding: 4,
  },
  toggleActive: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleInactive: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toggleTextActive: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  toggleTextInactive: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  section: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardText: {
    flex: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  subject: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  classInfo: {
    fontSize: 16,
    color: '#6b7280',
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#137fec',
    borderRadius: 6,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endedCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  endedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  endedSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  endedTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statusIcon: {
    fontSize: 16,
    color: '#15803d',
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#15803d',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statPresent: {
    flex: 1,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statAbsent: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  statLabelPresent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#15803d',
  },
  statLabelAbsent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statValuePresent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
  },
  statValueAbsent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#991b1b',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    height: 80,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
  },
  navIcon: {
    fontSize: 28,
    color: '#6b7280',
  },
  navIconActive: {
    fontSize: 28,
    color: '#137fec',
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#137fec',
  },
});

export default TeacherDashboard;
