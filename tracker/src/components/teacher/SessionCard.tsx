// components/SessionCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { fontSize } from '../../utils/scale';

export type Session = {
  startEndTime: string;
  title: string;
  details: string;
  imageUri: string;
};

type Props = {
  session: Session;
  onStartAttendance: (session: Session) => void;
};

export default function SessionCard({ session, onStartAttendance }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.content}>
          <View style={styles.metaRow}>
            <View style={styles.statusDot} />
            <Text
              style={styles.timeText}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {session.startEndTime}
            </Text>
          </View>

          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {session.title}
          </Text>

          <Text
            style={styles.details}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {session.details}
          </Text>
        </View>

        <Image
          source={{ uri: session.imageUri }}
          style={styles.thumb}
          resizeMode="cover"
        />
      </View>

      <TouchableOpacity
        onPress={() => onStartAttendance(session)}
        style={styles.button}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText} numberOfLines={1} adjustsFontSizeToFit>
          Start Attendance
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  timeText: {
    fontSize: fontSize(12), // small meta text
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSize(18), // responsive
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: fontSize(22),
  },
  details: {
    fontSize: fontSize(14),
    color: '#64748b',
    fontWeight: '500',
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize(14),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
