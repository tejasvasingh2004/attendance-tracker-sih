export type Student = {
  id: string;
  name: string;
  avatar: string;
};

export type AttendanceSession = {
  startEndTime: string;
  title: string;
  details: string;
  imageUri: string;
};

export type RootStackParamList = {
  AuthScreen: undefined;
  TeacherHome: undefined;
  AttendanceScreen: {
    session: AttendanceSession;
  };
};
