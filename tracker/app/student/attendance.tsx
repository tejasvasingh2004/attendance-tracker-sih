import React from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Svg, { Line, Polyline, Text as SvgText, G } from 'react-native-svg'

type Subject = {
  name: string
  status: 'Good' | 'Needs Attention' | 'Critical'
  total: number
  attended: number
  percent: number
}

const SUBJECTS: Subject[] = [
  { name: 'Mathematics', status: 'Good', total: 20, attended: 18, percent: 90 },
  { name: 'Physics', status: 'Needs Attention', total: 20, attended: 15, percent: 75 },
  { name: 'Chemistry', status: 'Critical', total: 20, attended: 12, percent: 60 },
]

function StatusPill({ status }: { status: Subject['status'] }) {
  const color =
    status === 'Good' ? 'bg-green-100 text-green-800' : status === 'Needs Attention' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
  return (
    <View className={`px-2 py-0.5 rounded-full ${color}`}>
      <Text className="text-[10px] font-semibold">{status}</Text>
    </View>
  )
}

function ProgressBar({ percent, color }: { percent: number; color: 'green' | 'yellow' | 'red' }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const barColor = color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'
  return (
    <View className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
      <View className={`h-1.5 ${barColor}`} style={{ width: `${clamped}%` }} />
    </View>
  )
}

function LabeledPicker({
  value,
  onChange,
  items,
  accessibilityLabel,
}: {
  value: string
  onChange: (val: string) => void
  items: { label: string; value: string }[]
  accessibilityLabel: string
}) {
  return (
    <View className="flex-1">
      <View className="relative h-11 rounded-md border border-gray-300 bg-white overflow-hidden pr-8">
        <View className="absolute right-3 top-0 bottom-0 justify-center pointer-events-none">
          <Ionicons name="chevron-down" size={18} color="#6b7280" />
        </View>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          mode={Platform.OS === 'ios' ? 'dialog' : 'dropdown'}
          dropdownIconColor={Platform.OS === 'android' ? 'transparent' : '#6b7280'}
          accessibilityLabel={accessibilityLabel}
          style={{ color: '#374151', height: 44, width: '100%', marginLeft: Platform.OS === 'android' ? 6 : 0 }}
          itemStyle={Platform.OS === 'ios' ? { fontSize: 14, color: '#374151' } : undefined}
        >
          {items.map((it) => (
            <Picker.Item key={it.value} label={it.label} value={it.value} />
          ))}
        </Picker>
      </View>
    </View>
  )
}

export default function AttendanceScreen() {
  const [month, setMonth] = React.useState<string>('Filter by Month')
  const [sort, setSort] = React.useState<string>('Sort by Lowest Attendance')

  const sorted = React.useMemo(() => {
    const copy = [...SUBJECTS]
    if (sort === 'Sort by Highest Attendance') {
      copy.sort((a, b) => b.percent - a.percent)
    } else if (sort === 'Sort by Lowest Attendance') {
      copy.sort((a, b) => a.percent - b.percent)
    }
    return copy
  }, [sort])

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white shadow-sm">
          <View className="flex-row items-center justify-center p-4">
            <Text className="text-gray-800 text-xl font-bold">Attendance</Text>
            <TouchableOpacity className="absolute right-4" accessibilityRole="button" accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }}>
          <View className="p-4 gap-6">
            {/* Subject list */}
            <View>
              <Text className="text-gray-800 text-xl font-bold mb-4">Subject-Wise List</Text>
              <View className="flex-row items-center gap-2 mb-4">
                <LabeledPicker
                  value={month}
                  onChange={setMonth}
                  accessibilityLabel="Filter by Month"
                  items={[
                    { label: 'Filter by Month', value: 'Filter by Month' },
                    { label: 'January', value: 'January' },
                    { label: 'February', value: 'February' },
                    { label: 'March', value: 'March' },
                  ]}
                />
                <LabeledPicker
                  value={sort}
                  onChange={setSort}
                  accessibilityLabel="Sort by attendance"
                  items={[
                    { label: 'Sort by Lowest Attendance', value: 'Sort by Lowest Attendance' },
                    { label: 'Sort by Highest Attendance', value: 'Sort by Highest Attendance' },
                  ]}
                />
              </View>

              <View className="gap-3">
                {sorted.map((s) => (
                  <View key={s.name} className="bg-white p-4 rounded-lg shadow-sm">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-800 text-base font-medium">{s.name}</Text>
                      <StatusPill status={s.status} />
                    </View>
                    <Text className="text-gray-500 text-sm mt-1">Total Classes: {s.total} | Attended: {s.attended}</Text>
                    <View className="flex-row items-center gap-2 mt-2">
                      <View className="flex-1 min-w-0">
                        <ProgressBar
                          percent={s.percent}
                          color={s.status === 'Good' ? 'green' : s.status === 'Needs Attention' ? 'yellow' : 'red'}
                        />
                      </View>
                      <Text className="text-gray-600 text-sm font-semibold">{s.percent}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Analytics */}
            <View>
              <Text className="text-gray-800 text-xl font-bold mb-4">Analytics</Text>
              <View className="bg-white p-4 rounded-lg shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-gray-700 font-semibold">Attendance Trend</Text>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <View className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <Text className="text-gray-600 text-xs">Your Trend</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <Text className="text-gray-600 text-xs">Min. 75%</Text>
                    </View>
                  </View>
                </View>
                <View className="h-48 w-full">
                  <Svg width="100%" height="100%" viewBox="0 0 350 150" preserveAspectRatio="none">
                    <Line x1="30" y1="130" x2="330" y2="130" stroke="#d1d5db" strokeWidth={1} />
                    <Line x1="30" y1="20" x2="30" y2="130" stroke="#d1d5db" strokeWidth={1} />
                    <SvgText x="5" y="135" fill="#6b7280" fontSize="10">0%</SvgText>
                    <SvgText x="5" y="78" fill="#6b7280" fontSize="10">50%</SvgText>
                    <SvgText x="0" y="25" fill="#6b7280" fontSize="10">100%</SvgText>
                    <Polyline
                      points="50,40 100,50 150,30 200,60 250,45 300,55"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line x1="30" y1="62.5" x2="330" y2="62.5" stroke="#ef4444" strokeDasharray="4" strokeWidth={1.5} />
                    <G>
                      <SvgText x="45" y="145" fill="#6b7280" fontSize="10">W1</SvgText>
                      <SvgText x="95" y="145" fill="#6b7280" fontSize="10">W2</SvgText>
                      <SvgText x="145" y="145" fill="#6b7280" fontSize="10">W3</SvgText>
                      <SvgText x="195" y="145" fill="#6b7280" fontSize="10">W4</SvgText>
                      <SvgText x="245" y="145" fill="#6b7280" fontSize="10">W5</SvgText>
                      <SvgText x="295" y="145" fill="#6b7280" fontSize="10">W6</SvgText>
                    </G>
                  </Svg>
                </View>
              </View>
            </View>

            {/* Insights */}
            <View>
              <Text className="text-gray-800 text-xl font-bold mb-4">Insights &amp; Warnings</Text>
              <View className="gap-3">
                <View className="flex-row items-start gap-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <MaterialIcons name="warning-amber" size={18} color="#ca8a04" style={{ marginTop: 2 }} />
                  <Text className="text-yellow-800 text-sm">If you miss 2 more classes in <Text className="font-semibold">Chemistry</Text>, your attendance will fall below 75%.</Text>
                </View>
                <View className="flex-row items-start gap-3 bg-red-50 border border-red-200 p-3 rounded-lg">
                  <MaterialIcons name="error-outline" size={18} color="#dc2626" style={{ marginTop: 2 }} />
                  <Text className="text-red-800 text-sm">Your attendance in <Text className="font-semibold">Chemistry</Text> is critically low. Immediate action is required.</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
