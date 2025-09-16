import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import AttendanceScreen from './screens/AttendenceScreen';
import BroadcastScreen from './screens/BroadcastScreen';
import LiveAttendanceScreen from './screens/LiveAttendanceScreen';
import TeacherDashboard from './TeacherDashboard';
import SignupScreen from './screens/signupscreen';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: () => {
            // Simple text icons for demonstration
            let iconName = '';
            switch (route.name) {
              case 'Home':
                iconName = '🏠';
                break;
              case 'Attendance':
                iconName = '📝';
                break;
              case 'Broadcast':
                iconName = '📡';
                break;
              case 'Live':
                iconName = '🎥';
                break;
              case 'Dashboard':
                iconName = '📊';
                break;
              case 'Signup':
                iconName = '🔐';
                break;
              default:
                iconName = '❓';
            }
            return <Text style={{ fontSize: 20 }}>{iconName}</Text>;
          },
          tabBarLabel: route.name,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Attendance" component={AttendanceScreen} />
        <Tab.Screen name="Broadcast" component={BroadcastScreen} />
        <Tab.Screen name="Live" component={LiveAttendanceScreen} />
        <Tab.Screen name="Dashboard" component={TeacherDashboard} />
        <Tab.Screen name="Signup" component={SignupScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
