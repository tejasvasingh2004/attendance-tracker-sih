// import React from 'react';
// import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';

// const ProfileScreen: React.FC = () => {
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.iconButton}>
//           <MaterialIcons name="arrow-back" size={24} color="#4b5563" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Profile</Text>
//         <View style={styles.iconButton} /> {/* Empty placeholder for symmetry */}
//       </View>

//       {/* Main Content */}
//       <ScrollView style={styles.main} contentContainerStyle={styles.contentContainer}>
//         {/* Profile Info */}
//         <View style={styles.profileInfo}>
//           <Image
//             source={{
//               uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkeiYEdeLFID-SBoAKVC4AO5argpg8Xuo5Krxf1mIVMNv7fZDWbDJfO0HR6A6BCnwP3W1l0_VjHYEKQva6Xa9x2LOXRMfIBBsRdgfv2-oLsNXwhscXBceHGbYxvvefb0qsCqbpDEvN-06gXh_Igg0OqX81H_YzGsOQBvTRVaVzarY0VazBDaoZWAdHdMffHDxCWImoAiPfmdCZ_3WygTd6N8Zku_SMs0mVpFg-_QQff5drmmYOicJuPPAUQa_BP1RQ7P9MOuKG9gjn"
//             }}
//             style={styles.profileImage}
//           />
//           <Text style={styles.name}>Rohan</Text>
//           <Text style={styles.contact}>123456789</Text>
//         </View>

//         {/* Student Information */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Student Information</Text>
//           <View style={styles.card}>
//             <View style={styles.cardRow}>
//               <Text style={styles.cardLabel}>Department</Text>
//               <Text style={styles.cardValue}>Computer Science</Text>
//             </View>
//             <View style={styles.cardRow}>
//               <Text style={styles.cardLabel}>Year</Text>
//               <Text style={styles.cardValue}>2nd Year</Text>
//             </View>
//           </View>
//         </View>

//         {/* Academic Details */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Academic Details</Text>
//           <View style={styles.card}>
//             <View style={styles.cardRow}>
//               <Text style={styles.cardLabel}>Course</Text>
//               <Text style={styles.cardValue}>B.Tech</Text>
//             </View>
//             <View style={styles.cardRow}>
//               <Text style={styles.cardLabel}>Batch</Text>
//               <Text style={styles.cardValue}>2021-2025</Text>
//             </View>
//             <View style={styles.cardRow}>
//               <Text style={styles.cardLabel}>Section</Text>
//               <Text style={styles.cardValue}>A</Text>
//             </View>
//           </View>
//         </View>

//         {/* App Settings */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>App Settings</Text>
//           <View style={styles.card}>
//             <TouchableOpacity style={styles.cardButton}>
//               <Text style={styles.cardButtonText}>Change Password</Text>
//               <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.cardButton}>
//               <Text style={styles.cardButtonText}>Update Email / Phone Number</Text>
//               <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Log Out */}
//         <View style={styles.logoutContainer}>
//           <TouchableOpacity style={styles.logoutButton}>
//             <Text style={styles.logoutText}>Log Out</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.footerItem}>
//           <MaterialIcons name="home" size={24} color="#6b7280" />
//           <Text style={styles.footerText}>Home</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem}>
//           <MaterialIcons name="calendar-month" size={24} color="#6b7280" />
//           <Text style={styles.footerText}>Attendance</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem}>
//           <MaterialIcons name="person" size={24} color="#137fec" />
//           <Text style={[styles.footerText, { color: "#137fec" }]}>Profile</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9fafb", // Tailwind gray-50
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 16,
//     backgroundColor: "white",
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//   },
//   iconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#111827",
//   },
//   main: {
//     flex: 1,
//   },
//   contentContainer: {
//     paddingBottom: 80,
//   },
//   profileInfo: {
//     alignItems: "center",
//     padding: 24,
//     backgroundColor: "white",
//   },
//   profileImage: {
//     width: 112,
//     height: 112,
//     borderRadius: 56,
//     marginBottom: 16,
//   },
//   name: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#111827",
//   },
//   contact: {
//     fontSize: 16,
//     color: "#6b7280",
//   },
//   section: {
//     marginTop: 16,
//     paddingHorizontal: 16,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1f2937",
//     marginBottom: 8,
//   },
//   card: {
//     backgroundColor: "white",
//     borderRadius: 8,
//     elevation: 1,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cardRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f3f4f6",
//   },
//   cardLabel: {
//     fontSize: 16,
//     color: "#4b5563",
//   },
//   cardValue: {
//     fontSize: 16,
//     fontWeight: "500",
//     color: "#111827",
//   },
//   cardButton: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f3f4f6",
//   },
//   cardButtonText: {
//     fontSize: 16,
//     color: "#1f2937",
//   },
//   logoutContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 32,
//   },
//   logoutButton: {
//     backgroundColor: "#fee2e2",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   logoutText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#b91c1c",
//   },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 8,
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//     backgroundColor: "white",
//   },
//   footerItem: {
//     alignItems: "center",
//   },
//   footerText: {
//     fontSize: 12,
//     color: "#6b7280",
//     marginTop: 4,
//   },
// });
