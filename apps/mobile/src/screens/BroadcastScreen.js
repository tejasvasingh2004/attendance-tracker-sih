import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BroadcastScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BROADCAST SIGNAL</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.broadcastingText}>Broadcasting signal</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.infoText}>Students can now mark their attendance through their app.</Text>
        <View style={styles.timerContainer}>
          <View style={styles.timerBox}>
            <Text style={styles.timerValue}>02</Text>
            <Text style={styles.timerLabel}>Minutes</Text>
          </View>
          <View style={styles.timerBox}>
            <Text style={styles.timerValue}>30</Text>
            <Text style={styles.timerLabel}>Seconds</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.stopButton}>
          <Text style={styles.stopButtonText}>Stop Broadcast</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
  },
  closeIcon: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  broadcastingText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 20,
  },
  progressBar: {
    width: '50%', // Placeholder value
    height: '100%',
    backgroundColor: '#1E3A8A',
    borderRadius: 4,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 50,
  },
  timerBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '45%',
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  timerLabel: {
    fontSize: 14,
    color: '#555',
  },
  stopButton: {
    backgroundColor: '#9CA3AF',
    paddingVertical: 15,
    width: '80%',
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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