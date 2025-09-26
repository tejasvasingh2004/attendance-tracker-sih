import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentLogin from './src/auth/StudentLogin';
import TeacherLogin from './src/auth/TeacherLogin';
// import StudentSignup from './src/auth/StudentSignup';
// import StudentHome from './src/student/StudentHome'; // create this
import { enableScreens } from 'react-native-screens';
import StudentSignup from './src/auth/StudentSignup';
enableScreens();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="StudentLogin">
          <Stack.Screen name="StudentLogin" component={StudentLogin}  options={{ headerShown: false }}/>
          <Stack.Screen name="TeacherLogin" component={TeacherLogin}  options={{ headerShown: false }}/>
          <Stack.Screen name="StudentSignup" component={StudentSignup}  options={{ headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
