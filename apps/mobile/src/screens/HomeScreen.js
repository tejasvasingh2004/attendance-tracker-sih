import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ATTENDANCE TRACKER</Text>
          <View style={styles.iconPlaceholder} />
        </View>
        <Text style={styles.greeting}>GOOD MORNING, PROF. AMELIA!</Text>

        <View style={styles.upcomingLectures}>
          <Text style={styles.sectionTitle}>Upcoming Lectures (Today)</Text>
          <View style={styles.lectureCard}>
            <View style={styles.lectureDetails}>
              <Text style={styles.lectureTime}>9:00 AM - 10:00 AM</Text>
              <Text style={styles.lectureName}>Calculus I</Text>
              <Text style={styles.lectureClass}>Class A</Text>
            </View>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Attendance</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
            <View style={styles.imagePlaceholder} />
          </View>
        </View>
        
        <View style={styles.quickStats}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Total Students</Text>
              <Text style={styles.statValue}>30</Text>
              <Text style={styles.statChange}>+10%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Present</Text>
              <Text style={styles.statValue}>28</Text>
              <Text style={styles.statChangeNegative}>-5%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statTitle}>Absent</Text>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statChange}>+15%</Text>
            </View>
          </View>
        </View>

        <View style={styles.reportsSection}>
          <Text style={styles.sectionTitle}>Export & Reports</Text>
          <View style={styles.reportsButtons}>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Export Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportButtonText}>Select Class</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.notifications}>
          <Text style={styles.sectionTitle}>Notifications/Updates</Text>
          <Text style={styles.notificationText}>Class B cancelled due to unforeseen circumst...</Text>
          <Text style={styles.notificationText}>Reminder: Submit attendance for Class C</Text>
          <Text style={styles.notificationText}>Low attendance alert for Class D</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>Lectures</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>📄</Text>
          <Text style={styles.navLabel}>Reports</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexDirection: 'row',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
    backgroundColor: '#ccc',
    position: 'absolute',
    right: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    marginHorizontal: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  upcomingLectures: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  lectureCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  lectureDetails: {
    flex: 1,
  },
  lectureTime: {
    fontSize: 14,
    color: '#888',
  },
  lectureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  lectureClass: {
    fontSize: 14,
    color: '#888',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#E0E7FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    marginRight: 5,
  },
  arrowIcon: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: 18,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginLeft: 15,
  },
  quickStats: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statTitle: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statChange: {
    color: '#16A34A',
    marginTop: 5,
    fontWeight: 'bold',
  },
  statChangeNegative: {
    color: '#DC2626',
    marginTop: 5,
    fontWeight: 'bold',
  },
  reportsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  reportsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#9CA3AF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  reportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notifications: {
    marginHorizontal: 20,
    marginBottom: 100,
  },
  notificationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 12,
    color: '#555',
  },
});
