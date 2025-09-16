import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LiveAttendanceScreen() {
  const students = [
    { id: '1', name: 'Ethan Harper', studentId: '12345', image: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Olivia Bennett', studentId: '67890', image: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Noah Carter', studentId: '24680', image: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: 'Sophia Davis', studentId: '13579', image: 'https://i.pravatar.cc/150?img=4' },
    { id: '5', name: 'Liam Evans', studentId: '97531', image: 'https://i.pravatar.cc/150?img=5' },
    { id: '6', name: 'Jackson Gray', studentId: '11223', image: 'https://i.pravatar.cc/150?img=6' },
    { id: '7', name: 'Ava Foster', studentId: '86420', image: 'https://i.pravatar.cc/150?img=7' },
    { id: '8', name: 'Isabella Hayes', studentId: '44556', image: 'https://i.pravatar.cc/150?img=8' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.studentItem}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentId}>ID: {item.studentId}</Text>
      </View>
      <View style={styles.statusIndicator} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LIVE ATTENDANCE</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Student here"
          placeholderTextColor="#A0A0A0"
        />
      </View>
      <FlatList
        data={students}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
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
  backButton: {
    position: 'absolute',
    left: 20,
  },
  backIcon: {
    color: '#fff',
    fontSize: 30,
  },
  searchBarContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  searchBar: {
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  studentId: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A', // Represents present
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
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