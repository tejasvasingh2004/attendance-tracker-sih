import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AttendanceScreen, TeacherHome } from './src/screens/teacher';
import { enableScreens } from 'react-native-screens';
import { validateAuthState } from './src/core/api/client';
import AuthScreen from './src/screens/auth';
import { RootStackParamList } from './src/types/navigation';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [token, setToken] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkAuthState = async () => {
      try {
        const authState = await validateAuthState();

        if (authState.isValid && authState.token && authState.user) {
          setToken(authState.token);
          setUserRole(authState.user.role);
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const getInitialRoute = () => {
    if (!token || !userRole) return 'AuthScreen';

    switch (userRole) {
      case 'TEACHER':
        return 'TeacherHome';
      case 'STUDENT':
        return 'TeacherHome';
      default:
        return 'AuthScreen';
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={getInitialRoute()}>
          <Stack.Screen
            name="AuthScreen"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TeacherHome"
            component={TeacherHome}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AttendanceScreen"
            component={AttendanceScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});
