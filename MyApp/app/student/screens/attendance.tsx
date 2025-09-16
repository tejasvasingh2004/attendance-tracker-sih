// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   TouchableOpacity,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { MaterialIcons } from '@expo/vector-icons';
// import Svg, { Line, Text as SvgText, Polyline } from 'react-native-svg';

// const AttendanceScreen: React.FC = () => {
//   const [month, setMonth] = useState('Filter by Month');
//   const [sort, setSort] = useState('Sort by Lowest Attendance');

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Attendance</Text>
//         <TouchableOpacity style={styles.notificationButton}>
//           <MaterialIcons name="notifications" size={24} color="#4b5563" />
//         </TouchableOpacity>
//       </View>

//       {/* Main Content */}
//       <ScrollView contentContainerStyle={styles.contentContainer}>
//         {/* Subject-Wise List */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Subject-Wise List</Text>
//           <View style={styles.filterRow}>
//             <View style={styles.pickerContainer}>
//               <Picker
//                 selectedValue={month}
//                 onValueChange={setMonth}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="Filter by Month" value="Filter by Month" />
//                 <Picker.Item label="January" value="January" />
//                 <Picker.Item label="February" value="February" />
//                 <Picker.Item label="March" value="March" />
//               </Picker>
//             </View>
//             <View style={styles.pickerContainer}>
//               <Picker
//                 selectedValue={sort}
//                 onValueChange={setSort}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="Sort by Lowest Attendance" value="Sort by Lowest Attendance" />
//                 <Picker.Item label="Sort by Highest Attendance" value="Sort by Highest Attendance" />
//               </Picker>
//             </View>
//           </View>

//           {/* Subjects */}
//           {[
//             {
//               name: 'Mathematics',
//               status: 'Good',
//               statusColor: '#d1fae5',
//               statusTextColor: '#065f46',
//               total: 20,
//               attended: 18,
//               percent: 90,
//               barColor: '#10b981',
//             },
//             {
//               name: 'Physics',
//               status: 'Needs Attention',
//               statusColor: '#fef3c7',
//               statusTextColor: '#78350f',
//               total: 20,
//               attended: 15,
//               percent: 75,
//               barColor: '#f59e0b',
//             },
//             {
//               name: 'Chemistry',
//               status: 'Critical',
//               statusColor: '#fee2e2',
//               statusTextColor: '#991b1b',
//               total: 20,
//               attended: 12,
//               percent: 60,
//               barColor: '#ef4444',
//             },
//           ].map((subj, index) => (
//             <View key={index} style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <Text style={styles.cardTitle}>{subj.name}</Text>
//                 <View style={[styles.statusBadge, { backgroundColor: subj.statusColor }]}>
//                   <Text style={[styles.statusText, { color: subj.statusTextColor }]}>{subj.status}</Text>
//                 </View>
//               </View>
//               <Text style={styles.cardSubText}>Total Classes: {subj.total} | Attended: {subj.attended}</Text>
//               <View style={styles.progressRow}>
//                 <View style={styles.progressBarBackground}>
//                   <View style={[styles.progressBarFill, { width: `${subj.percent}%`, backgroundColor: subj.barColor }]} />
//                 </View>
//                 <Text style={styles.progressPercent}>{subj.percent}%</Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* Analytics */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Analytics</Text>
//           <View style={styles.card}>
//             <View style={styles.analyticsHeader}>
//               <Text style={styles.analyticsTitle}>Attendance Trend</Text>
//               <View style={styles.analyticsLegend}>
//                 <View style={styles.legendItem}>
//                   <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
//                   <Text style={styles.legendText}>Your Trend</Text>
//                 </View>
//                 <View style={styles.legendItem}>
//                   <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
//                   <Text style={styles.legendText}>Min. 75%</Text>
//                 </View>
//               </View>
//             </View>
//             <View style={styles.chartContainer}>
//               <Svg width="100%" height="100%" viewBox="0 0 350 150" preserveAspectRatio="none">
//                 <Line x1="30" y1="130" x2="330" y2="130" stroke="#d1d5db" strokeWidth="1" />
//                 <Line x1="30" y1="20" x2="30" y2="130" stroke="#d1d5db" strokeWidth="1" />
//                 <SvgText x="5" y="135" fontSize="10" fill="#6b7280">0%</SvgText>
//                 <SvgText x="5" y="78" fontSize="10" fill="#6b7280">50%</SvgText>
//                 <SvgText x="0" y="25" fontSize="10" fill="#6b7280">100%</SvgText>
//                 <Polyline
//                   points="50,40 100,50 150,30 200,60 250,45 300,55"
//                   fill="none"
//                   stroke="#3b82f6"
//                   strokeWidth="2"
//                 />
//                 <Line x1="30" y1="62.5" x2="330" y2="62.5" stroke="#ef4444" strokeDasharray="4" strokeWidth="1.5" />
//                 <SvgText x="45" y="145" fontSize="10" fill="#6b7280">W1</SvgText>
//                 <SvgText x="95" y="145" fontSize="10" fill="#6b7280">W2</SvgText>
//                 <SvgText x="145" y="145" fontSize="10" fill="#6b7280">W3</SvgText>
//                 <SvgText x="195" y="145" fontSize="10" fill="#6b7280">W4</SvgText>
//                 <SvgText x="245" y="145" fontSize="10" fill="#6b7280">W5</SvgText>
//                 <SvgText x="295" y="145" fontSize="10" fill="#6b7280">W6</SvgText>
//               </Svg>
//             </View>
//           </View>
//         </View>

//         {/* Insights & Warnings */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Insights & Warnings</Text>
//           <View style={styles.warningCard}>
//             <MaterialIcons name="warning" size={24} color="#78350f" style={styles.warningIcon} />
//             <Text style={styles.warningText}>
//               If you miss 2 more classes in <Text style={styles.boldText}>Chemistry</Text>, your attendance will fall below 75%.
//             </Text>
//           </View>
//           <View style={styles.errorCard}>
//             <MaterialIcons name="error" size={24} color="#991b1b" style={styles.warningIcon} />
//             <Text style={styles.errorText}>
//               Your attendance in <Text style={styles.boldText}>Chemistry</Text> is critically low. Immediate action is required.
//             </Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <TouchableOpacity style={styles.footerItem}>
//           <MaterialIcons name="home" size={24} color="#6b7280" />
//           <Text style={styles.footerText}>Home</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.footerItem, styles.footerActive]}>
//           <MaterialIcons name="calendar-month" size={24} color="#2563eb" />
//           <Text style={[styles.footerText, { color: '#2563eb' }]}>Attendance</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.footerItem}>
//           <MaterialIcons name="person" size={24} color="#6b7280" />
//           <Text style={styles.footerText}>Profile</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default AttendanceScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9fafb', // Tailwind gray-50
//   },
//   header: {
//     backgroundColor: 'white',
//     padding: 16,
//     alignItems: 'center',
//     position: 'relative',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1f2937',
//   },
//   notificationButton: {
//     position: 'absolute',
//     right: 16,
//     top: 16,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   contentContainer: {
//     padding: 16,
//     paddingBottom: 80,
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1f2937',
//     marginBottom: 12,
//   },
//   filterRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     gap: 8,
//   },
//   pickerContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderColor: '#d1d5db',
//     borderWidth: 1,
//     borderRadius: 6,
//   },
//   picker: {
//     height: 40,
//     width: '100%',
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
