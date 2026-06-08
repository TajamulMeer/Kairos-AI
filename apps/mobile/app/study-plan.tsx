import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, startOfWeek } from 'date-fns';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '@constants/theme';
import { apiClient } from '@services/api.service';
import { ENDPOINTS } from '@constants/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StudyPlanScreen() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const queryClient = useQueryClient();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const { data: weeklyPlan, isLoading } = useQuery({
    queryKey: ['weekly-plan'],
    queryFn: () => apiClient.get(ENDPOINTS.STUDY_PLANS_WEEKLY).then(r => r.data),
  });

  const { mutate: generatePlan, isPending: isGenerating } = useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.AI_STUDY_PLAN).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
      queryClient.invalidateQueries({ queryKey: ['today-plan'] });
      Alert.alert('Success', 'Your AI study plan has been generated!');
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to generate plan.'),
  });

  const { mutate: markTask } = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      apiClient.patch(`/study-plans/tasks/${taskId}`, { completed }).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['weekly-plan'] }),
  });

  const selectedDayStr = format(selectedDay, 'yyyy-MM-dd');
  const dayTasks = weeklyPlan?.tasks?.filter((t: any) => t.date === selectedDayStr) || [];

  const getSubjectColor = (subject: string) => {
    if (subject?.toLowerCase().includes('bio')) return Colors.biology;
    if (subject?.toLowerCase().includes('phy')) return Colors.physics;
    if (subject?.toLowerCase().includes('chem')) return Colors.chemistry;
    return Colors.primary;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Study Plan</Text>
        <TouchableOpacity
          style={styles.genButton}
          onPress={() => generatePlan()}
          disabled={isGenerating}
        >
          {isGenerating ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.genButtonText}>🤖 AI</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Week Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekScroll}>
          {DAYS.map((day, idx) => {
            const date = addDays(weekStart, idx);
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = format(selectedDay, 'yyyy-MM-dd') === dateStr;
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
            const dayTasks_ = weeklyPlan?.tasks?.filter((t: any) => t.date === dateStr) || [];
            const completedCount = dayTasks_.filter((t: any) => t.completed).length;

            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, isSelected && styles.dayChipActive, isToday && styles.dayChipToday]}
                onPress={() => setSelectedDay(date)}
              >
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{day}</Text>
                <Text style={[styles.dayDate, isSelected && styles.dayDateActive]}>{format(date, 'd')}</Text>
                {dayTasks_.length > 0 && (
                  <View style={[styles.dayDot, completedCount === dayTasks_.length && styles.dayDotDone]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Day */}
        <View style={styles.selectedDayHeader}>
          <Text style={styles.selectedDayText}>
            {format(selectedDay, 'EEEE, dd MMM')}
            {format(selectedDay, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? ' (Today)' : ''}
          </Text>
          {dayTasks.length > 0 && (
            <Text style={styles.selectedDayProgress}>
              {dayTasks.filter((t: any) => t.completed).length}/{dayTasks.length} done
            </Text>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
        ) : dayTasks.length > 0 ? (
          <View style={styles.tasksList}>
            {dayTasks.map((task: any) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, task.completed && styles.taskCardDone, Shadow.sm]}
                onPress={() => markTask({ taskId: task.id, completed: !task.completed })}
              >
                <View style={[styles.taskCheck, task.completed && styles.taskCheckDone]}>
                  {task.completed && <Text style={styles.taskCheckMark}>✓</Text>}
                </View>
                <View style={[styles.taskSubjectBar, { backgroundColor: getSubjectColor(task.subject) }]} />
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>{task.title}</Text>
                  <Text style={styles.taskMeta}>{task.subject} • {task.durationMinutes} min</Text>
                  {task.type && (
                    <View style={styles.taskTypeBadge}>
                      <Text style={styles.taskTypeText}>{task.type.replace('_', ' ')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.taskDuration}>{task.durationMinutes}m</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayEmoji}>📅</Text>
            <Text style={styles.emptyDayText}>No tasks scheduled for this day.</Text>
            <TouchableOpacity
              style={styles.generateDayButton}
              onPress={() => generatePlan()}
              disabled={isGenerating}
            >
              <Text style={styles.generateDayButtonText}>Generate AI Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray200 },
  backText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600', width: 60 },
  title: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.gray900 },
  genButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, backgroundColor: Colors.primary + '15', borderRadius: BorderRadius.full },
  genButtonText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  weekScroll: { marginBottom: Spacing.lg },
  dayChip: { alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.xl, marginRight: Spacing.sm, borderWidth: 1.5, borderColor: Colors.gray200, backgroundColor: Colors.white, minWidth: 56 },
  dayChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayChipToday: { borderColor: Colors.primary },
  dayLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.gray500 },
  dayLabelActive: { color: Colors.white },
  dayDate: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900, marginTop: 2 },
  dayDateActive: { color: Colors.white },
  dayDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.warning, marginTop: 4 },
  dayDotDone: { backgroundColor: Colors.success },
  selectedDayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  selectedDayText: { fontSize: FontSize.base, fontWeight: '800', color: Colors.gray900 },
  selectedDayProgress: { fontSize: FontSize.sm, color: Colors.success, fontWeight: '700' },
  tasksList: { gap: Spacing.sm },
  taskCard: { backgroundColor: Colors.white, borderRadius: BorderRadius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  taskCardDone: { opacity: 0.7 },
  taskCheck: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.gray300, alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  taskCheckMark: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
  taskSubjectBar: { width: 4, height: 48, borderRadius: 2 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray900 },
  taskTitleDone: { textDecorationLine: 'line-through', color: Colors.gray500 },
  taskMeta: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  taskTypeBadge: { marginTop: 4, backgroundColor: Colors.gray100, borderRadius: BorderRadius.sm, paddingVertical: 2, paddingHorizontal: Spacing.sm, alignSelf: 'flex-start' },
  taskTypeText: { fontSize: 10, color: Colors.gray600, fontWeight: '600', textTransform: 'capitalize' },
  taskDuration: { fontSize: FontSize.xs, color: Colors.gray500, fontWeight: '600' },
  emptyDay: { alignItems: 'center', padding: Spacing.xxl },
  emptyDayEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyDayText: { fontSize: FontSize.base, color: Colors.gray500, textAlign: 'center', marginBottom: Spacing.lg },
  generateDayButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, ...Shadow.primary },
  generateDayButtonText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
});
