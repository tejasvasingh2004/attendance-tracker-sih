import * as React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AttendanceScreen from './src/teacher/AttendanceScreen';
import TeacherHome from './src/teacher/Home';
import PhotoUploadScreen from './src/teacher/PhotoUploadScreen';
import ProxyReviewScreen from './src/teacher/ProxyReviewScreen';
// import BLEAdvertiser from 'react-native-ble-advertiser';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // function advertise() {
  //   BLEAdvertiser.broadcast(
  //     '0000feed-0000-1000-8000-00805f9b34fb', // valid service UUID
  //     Buffer.from('hello').toString('base64'), // 5-byte payload
  //     { includeDeviceName: true },
  //   );
  // }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

type Session = {
  startEndTime: string;
  title: string;
  details: string;
  imageUri: string;
};

function AppContent() {
  const [route, setRoute] = React.useState<
    'home' | 'photo' | 'attendance' | 'proxy'
  >('home');
  const [currentSession, setCurrentSession] = React.useState<Session | null>(
    null,
  );

  const goHome = () => {
    setRoute('home');
    setCurrentSession(null);
  };
  const startPhoto = (session: Session) => {
    setCurrentSession(session);
    setRoute('photo');
  };

  return (
    <View style={styles.container}>
      {route === 'home' && <TeacherHome onStartAttendance={startPhoto} />}
      {route === 'photo' && currentSession && (
        <PhotoUploadScreen session={currentSession} onBack={goHome} />
      )}
      {route === 'attendance' && currentSession && (
        <AttendanceScreen
          session={currentSession}
          onBack={goHome}
          onTakeProxyAction={() => setRoute('proxy')}
        />
      )}
      {route === 'proxy' && currentSession && (
        <ProxyReviewScreen session={currentSession} onBack={goHome} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
