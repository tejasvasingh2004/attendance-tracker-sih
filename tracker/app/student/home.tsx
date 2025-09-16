import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'

type TimetableItem = {
  subject: string
  teacher: string
  time: string
  color: string
  icon: keyof typeof Ionicons.glyphMap
  active?: boolean
}

const TIMETABLE: TimetableItem[] = [
  { subject: 'Mathematics', teacher: 'Mr. Sharma', time: '9:00 - 10:00 AM', color: '#3b82f6', icon: 'calculator-outline', active: true },
  { subject: 'Physics', teacher: 'Ms. Gupta', time: '10:00 - 11:00 AM', color: '#a855f7', icon: 'flask-outline' },
  { subject: 'Chemistry', teacher: 'Dr. Verma', time: '11:00 - 12:00 PM', color: '#ec4899', icon: 'beaker-outline' },
]

function SubjectRow({ item }: { item: TimetableItem }) {
  return (
    <View className="bg-white p-4 rounded-lg shadow-sm">
      <View className="flex-row items-center gap-4">
        <View className="items-center justify-center rounded-full" style={{ backgroundColor: item.color, width: 48, height: 48 }}>
          <Ionicons name={item.icon} size={24} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 text-base font-medium">{item.subject}</Text>
          <Text className="text-gray-500 text-sm">{item.teacher}</Text>
        </View>
        <View className="items-end">
          <Text className="text-gray-600 text-sm font-medium">{item.time}</Text>
          {item.active ? (
            <View className="inline-flex items-center rounded-full bg-green-100 px-2 py-1">
              <Text className="text-[10px] font-medium text-green-700">Active</Text>
            </View>
          ) : null}
        </View>
      </View>
      {item.active ? (
        <View className="mt-4">
          <TouchableOpacity className="w-full bg-blue-600 rounded-lg py-3 shadow-md active:opacity-90" accessibilityRole="button">
            <Text className="text-white font-bold text-base text-center">Mark Attendance</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  )
}

export default function StudentHome() {
  const percent = 85
  const radius = 64
  const stroke = 12
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const dashOffset = circumference - (percent / 100) * circumference

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white shadow-sm">
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-gray-800 text-2xl font-bold">Hi, Rohan</Text>
            <TouchableOpacity accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }}>
          <View className="p-4 gap-6">
            {/* Today's Timetable */}
            <View>
              <Text className="text-gray-800 text-xl font-bold mb-4">Today Timetable</Text>
              <View className="gap-4">
                {TIMETABLE.map((t) => (
                  <SubjectRow key={t.subject} item={t} />
                ))}
              </View>
            </View>

            {/* Overall Attendance */}
            <View>
              <Text className="text-gray-800 text-xl font-bold mb-4">Overall Attendance %</Text>
              <View className="bg-white p-6 rounded-lg shadow-sm items-center justify-center">
                <View className="relative" style={{ width: 160, height: 160 }}>
                  <Svg width={160} height={160}>
                    <Circle cx={80} cy={80} r={normalizedRadius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
                    <Circle
                      cx={80}
                      cy={80}
                      r={normalizedRadius}
                      stroke="#22c55e"
                      strokeWidth={stroke}
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      fill="none"
                      transform={`rotate(-90 80 80)`}
                    />
                  </Svg>
                  <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-4xl font-bold text-gray-800">{percent}%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Alerts */}
            <View>
              <Text className="text-gray-800 text-xl font-bold mb-4">Important Alerts / Highlights</Text>
              <View className="gap-3">
                <View className="flex-row items-center gap-3 bg-red-50 border border-red-200 p-3 rounded-lg">
                  <MaterialIcons name="warning-amber" size={18} color="#ef4444" />
                  <Text className="text-red-700 text-sm font-medium">You have 2 low-attendance subjects.</Text>
                </View>
                <View className="flex-row items-center gap-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <MaterialIcons name="info-outline" size={18} color="#3b82f6" />
                  <Text className="text-blue-700 text-sm font-medium">No class after 2 PM today.</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}


