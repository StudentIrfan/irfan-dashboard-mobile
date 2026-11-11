import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { addDays, format } from 'date-fns';
import { Card } from '../components/Card';
import { TaskItem } from '../components/TaskItem';
import { useStore } from '../store/useStore';
import { CATEGORY_COLORS, getThemeColors, PRIORITY_COLORS } from '../theme/colors';
import { typography } from '../theme/typography';
import { CategoryTag, Task } from '../types';
import {
  calculateTodayTaskCompletion,
  CountdownBreakdown,
  getNextUpcomingCountdown,
  getTodayISO,
} from '../utils/dateUtils';

interface CategoryOption {
  tag: CategoryTag;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORY_OPTIONS: readonly CategoryOption[] = [
  {
    tag: 'Travel/Logistics',
    subtitle: 'redBus / KLIA Transit',
    icon: 'bus-outline',
  },
  {
    tag: 'Expenses',
    subtitle: 'Setel / Tealive / Pop Meals',
    icon: 'card-outline',
  },
  {
    tag: 'Academic',
    subtitle: 'IIUM KICT / CCNA / Assignments',
    icon: 'school-outline',
  },
  {
    tag: 'General',
    subtitle: 'Mahallah & Daily Routines',
    icon: 'grid-outline',
  },
] as const;

const TIME_PRESETS: readonly string[] = ['08:30', '12:00', '14:30', '18:00', '21:00'] as const;

interface CircularProgressRingProps {
  percentage: number;
  primaryColor: string;
  trackColor: string;
  textColor: string;
  subtitleColor: string;
}

const RING_SIZE = 104;
const RING_STROKE = 10;
const HALF_SIZE = RING_SIZE / 2;

const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  percentage,
  primaryColor,
  trackColor,
  textColor,
  subtitleColor,
}) => {
  const animatedPercent = useSharedValue<number>(0);

  useEffect(() => {
    animatedPercent.value = withSpring(percentage, {
      damping: 18,
      stiffness: 110,
    });
  }, [percentage, animatedPercent]);

  const rightHalfAnimatedStyle = useAnimatedStyle(() => {
    const deg = interpolate(
      animatedPercent.value,
      [0, 50, 100],
      [-135, 45, 45],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotateZ: `${deg}deg` }],
    };
  });

  const leftHalfAnimatedStyle = useAnimatedStyle(() => {
    const deg = interpolate(
      animatedPercent.value,
      [0, 50, 100],
      [-135, -135, 45],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotateZ: `${deg}deg` }],
    };
  });

  return (
    <View style={styles.ringWrapper}>
      <View
        style={[
          styles.ringTrack,
          {
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: HALF_SIZE,
            borderWidth: RING_STROKE,
            borderColor: trackColor,
          },
        ]}
      />

      {/* Right semicircle clip */}
      <View
        style={[
          styles.halfClip,
          {
            width: HALF_SIZE,
            height: RING_SIZE,
            left: HALF_SIZE,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.halfArc,
            {
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: HALF_SIZE,
              borderWidth: RING_STROKE,
              left: -HALF_SIZE,
              borderTopColor: primaryColor,
              borderRightColor: primaryColor,
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            },
            rightHalfAnimatedStyle,
          ]}
        />
      </View>

      {/* Left semicircle clip */}
      <View
        style={[
          styles.halfClip,
          {
            width: HALF_SIZE,
            height: RING_SIZE,
            left: 0,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.halfArc,
            {
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: HALF_SIZE,
              borderWidth: RING_STROKE,
              left: 0,
              borderBottomColor: primaryColor,
              borderLeftColor: primaryColor,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
            },
            leftHalfAnimatedStyle,
          ]}
        />
      </View>

      <View style={styles.ringCenterContent}>
        <Text style={[typography.h2, { color: textColor }]}>{percentage}%</Text>
        <Text style={[typography.caption, { color: subtitleColor, fontSize: 10 }]}>
          Today
        </Text>
      </View>
    </View>
  );
};

export const TasksScreen: React.FC = () => {
  const themeMode = useStore((state) => state.theme);
  const tasks = useStore((state) => state.tasks);
  const calendarEvents = useStore((state) => state.calendarEvents);
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);

  const palette = getThemeColors(themeMode);

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | CategoryTag>('ALL');

  // Countdown Timer state
  const [countdown, setCountdown] = useState<CountdownBreakdown>(() =>
    getNextUpcomingCountdown(tasks, calendarEvents)
  );

  useEffect(() => {
    setCountdown(getNextUpcomingCountdown(tasks, calendarEvents));
    const timer = setInterval(() => {
      setCountdown(getNextUpcomingCountdown(tasks, calendarEvents));
    }, 1000);
    return () => clearInterval(timer);
  }, [tasks, calendarEvents]);

  // BottomSheet state & refs
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['82%'], []);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayISO());
  const [time, setTime] = useState<string>('14:30');
  const [priorityColor, setPriorityColor] = useState<string>(PRIORITY_COLORS[0].color);
  const [categoryTag, setCategoryTag] = useState<CategoryTag>('Travel/Logistics');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [sideNotes, setSideNotes] = useState<string>('');

  const datePresets = useMemo(
    () => [
      { label: 'Today', dateStr: format(new Date(), 'yyyy-MM-dd') },
      { label: 'Tomorrow', dateStr: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
      { label: '+3 Days', dateStr: format(addDays(new Date(), 3), 'yyyy-MM-dd') },
      { label: '+7 Days', dateStr: format(addDays(new Date(), 7), 'yyyy-MM-dd') },
    ],
    []
  );

  const openCreateSheet = useCallback((): void => {
    setEditingTaskId(null);
    setTitle('');
    setDate(getTodayISO());
    setTime('14:30');
    setPriorityColor(PRIORITY_COLORS[0].color);
    setCategoryTag('Travel/Logistics');
    setIsRecurring(false);
    setSideNotes('');
    bottomSheetRef.current?.expand();
  }, []);

  const openEditSheet = useCallback((task: Task): void => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDate(task.date);
    setTime(task.time);
    setPriorityColor(task.priorityColor);
    setCategoryTag(task.categoryTag);
    setIsRecurring(task.isRecurring);
    setSideNotes(task.sideNotes);
    bottomSheetRef.current?.expand();
  }, []);

  const handleSaveTask = useCallback((): void => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    const cleanDate = date.trim() || getTodayISO();
    const cleanTime = time.trim() || '09:00';

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: trimmedTitle,
        date: cleanDate,
        time: cleanTime,
        priorityColor,
        categoryTag,
        isRecurring,
        sideNotes: sideNotes.trim(),
      });
    } else {
      addTask({
        title: trimmedTitle,
        date: cleanDate,
        time: cleanTime,
        priorityColor,
        categoryTag,
        isRecurring,
        sideNotes: sideNotes.trim(),
        isCompleted: false,
      });
    }

    bottomSheetRef.current?.close();
  }, [
    title,
    date,
    time,
    priorityColor,
    categoryTag,
    isRecurring,
    sideNotes,
    editingTaskId,
    updateTask,
    addTask,
  ]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  const filteredTasks = useMemo(() => {
    if (selectedFilter === 'ALL') {
      return tasks;
    }
    return tasks.filter((t) => t.categoryTag === selectedFilter);
  }, [tasks, selectedFilter]);

  const todayCompletion = useMemo(
    () => calculateTodayTaskCompletion(tasks),
    [tasks]
  );

  const renderTaskItem = useCallback(
    ({ item }: ListRenderItemInfo<Task>) => (
      <TaskItem
        task={item}
        onPressEdit={openEditSheet}
        onDelete={deleteTask}
        onToggleComplete={toggleTaskCompletion}
      />
    ),
    [openEditSheet, deleteTask, toggleTaskCompletion]
  );

  const padZero = (num: number): string => String(num).padStart(2, '0');

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[typography.label, { color: palette.primary }]}>
              ACTION WORKSPACE
            </Text>
            <Text style={[typography.h1, { color: palette.text, marginTop: 2 }]}>
              Tasks & Logistics
            </Text>
          </View>

          <Pressable
            onPress={openCreateSheet}
            style={[styles.newTaskBtn, { backgroundColor: palette.primary }]}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.newTaskBtnText}>New Task</Text>
          </Pressable>
        </View>

        {/* Top Visualizer Row: Circular Progress Ring + Countdown Timer */}
        <Card style={styles.visualizerCard}>
          <View style={styles.visualizerRow}>
            <CircularProgressRing
              percentage={todayCompletion}
              primaryColor={palette.primary}
              trackColor={palette.surfaceElevated}
              textColor={palette.text}
              subtitleColor={palette.textSecondary}
            />

            <View
              style={[
                styles.visualizerDivider,
                { backgroundColor: palette.border },
              ]}
            />

            <View style={styles.countdownContainer}>
              <View style={styles.countdownHeader}>
                <Ionicons
                  name="timer-outline"
                  size={15}
                  color={palette.warning}
                />
                <Text
                  style={[
                    typography.label,
                    { color: palette.warning, marginLeft: 5 },
                  ]}
                >
                  NEXT UPCOMING
                </Text>
              </View>

              <Text
                numberOfLines={1}
                style={[
                  typography.subtitle,
                  { color: palette.text, marginTop: 4 },
                ]}
              >
                {countdown.title}
              </Text>

              <View style={styles.timerBoxesRow}>
                <View
                  style={[
                    styles.timerBox,
                    { backgroundColor: palette.surfaceElevated },
                  ]}
                >
                  <Text style={[typography.mono, { color: palette.text }]}>
                    {padZero(countdown.days)}
                  </Text>
                  <Text
                    style={[
                      styles.timerUnitText,
                      { color: palette.textMuted },
                    ]}
                  >
                    D
                  </Text>
                </View>
                <View
                  style={[
                    styles.timerBox,
                    { backgroundColor: palette.surfaceElevated },
                  ]}
                >
                  <Text style={[typography.mono, { color: palette.text }]}>
                    {padZero(countdown.hours)}
                  </Text>
                  <Text
                    style={[
                      styles.timerUnitText,
                      { color: palette.textMuted },
                    ]}
                  >
                    H
                  </Text>
                </View>
                <View
                  style={[
                    styles.timerBox,
                    { backgroundColor: palette.surfaceElevated },
                  ]}
                >
                  <Text style={[typography.mono, { color: palette.text }]}>
                    {padZero(countdown.minutes)}
                  </Text>
                  <Text
                    style={[
                      styles.timerUnitText,
                      { color: palette.textMuted },
                    ]}
                  >
                    M
                  </Text>
                </View>
                <View
                  style={[
                    styles.timerBox,
                    { backgroundColor: palette.primarySoft },
                  ]}
                >
                  <Text style={[typography.mono, { color: palette.primary }]}>
                    {padZero(countdown.seconds)}
                  </Text>
                  <Text
                    style={[
                      styles.timerUnitText,
                      { color: palette.primary },
                    ]}
                  >
                    S
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Category Filter Chips */}
        <View style={styles.filterBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(['ALL', 'Travel/Logistics', 'Expenses', 'Academic', 'General'] as const).map(
              (tag) => {
                const isSelected = selectedFilter === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setSelectedFilter(tag)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected
                          ? palette.primary
                          : palette.surface,
                        borderColor: isSelected
                          ? palette.primary
                          : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: isSelected ? '#FFFFFF' : palette.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {tag === 'ALL' ? 'All Tasks' : tag}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>
        </View>

        {/* Hint for Gesture */}
        <View style={styles.gestureHintRow}>
          <Text style={[typography.caption, { color: palette.textMuted }]}>
            Swipe right to complete • Swipe left to delete • Tap to edit
          </Text>
        </View>

        {/* Task FlatList */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={46}
                color={palette.textMuted}
              />
              <Text
                style={[
                  typography.subtitle,
                  { color: palette.textSecondary, marginTop: 10 },
                ]}
              >
                No tasks in this category
              </Text>
            </View>
          }
        />

        {/* CRUD Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
            borderWidth: 1,
          }}
          handleIndicatorStyle={{ backgroundColor: palette.textMuted }}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.sheetHeaderRow}>
              <Text style={[typography.h2, { color: palette.text }]}>
                {editingTaskId ? 'Edit Task' : 'Create New Task'}
              </Text>
              <Pressable onPress={() => bottomSheetRef.current?.close()}>
                <Ionicons
                  name="close-circle"
                  size={26}
                  color={palette.textMuted}
                />
              </Pressable>
            </View>

            {/* Title Input */}
            <Text
              style={[
                typography.label,
                { color: palette.textSecondary, marginBottom: 6 },
              ]}
            >
              TASK TITLE
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Book redBus TBS to Kuantan or Setel Top-up"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: palette.surfaceElevated,
                  color: palette.text,
                  borderColor: palette.border,
                },
              ]}
            />

            {/* Date Picker Presets + Input */}
            <Text
              style={[
                typography.label,
                { color: palette.textSecondary, marginTop: 14, marginBottom: 6 },
              ]}
            >
              DATE (YYYY-MM-DD)
            </Text>
            <View style={styles.presetRow}>
              {datePresets.map((preset) => {
                const active = date === preset.dateStr;
                return (
                  <Pressable
                    key={preset.label}
                    onPress={() => setDate(preset.dateStr)}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: active
                          ? palette.primary
                          : palette.surfaceElevated,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? '#FFFFFF' : palette.textSecondary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: palette.surfaceElevated,
                  color: palette.text,
                  borderColor: palette.border,
                  marginTop: 6,
                },
              ]}
            />

            {/* Time Picker Presets + Input */}
            <Text
              style={[
                typography.label,
                { color: palette.textSecondary, marginTop: 14, marginBottom: 6 },
              ]}
            >
              TIME (24H HH:MM)
            </Text>
            <View style={styles.presetRow}>
              {TIME_PRESETS.map((tPreset) => {
                const active = time === tPreset;
                return (
                  <Pressable
                    key={tPreset}
                    onPress={() => setTime(tPreset)}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: active
                          ? palette.primary
                          : palette.surfaceElevated,
                        borderColor: active ? palette.primary : palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? '#FFFFFF' : palette.textSecondary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {tPreset}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="14:30"
              placeholderTextColor={palette.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: palette.surfaceElevated,
                  color: palette.text,
                  borderColor: palette.border,
                  marginTop: 6,
                },
              ]}
            />

            {/* Priority Color Picker */}
            <Text
              style={[
                typography.label,
                { color: palette.textSecondary, marginTop: 14, marginBottom: 6 },
              ]}
            >
              PRIORITY LEVEL & COLOR
            </Text>
            <View style={styles.priorityRow}>
              {PRIORITY_COLORS.map((p) => {
                const selected =
                  priorityColor.toUpperCase() === p.color.toUpperCase();
                return (
                  <Pressable
                    key={p.label}
                    onPress={() => setPriorityColor(p.color)}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: selected
                          ? `${p.color}25`
                          : palette.surfaceElevated,
                        borderColor: selected ? p.color : palette.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.prioritySwatch,
                        { backgroundColor: p.color },
                      ]}
                    />
                    <Text
                      style={[
                        typography.caption,
                        {
                          color: palette.text,
                          fontWeight: selected ? '700' : '500',
                        },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Category Tag Picker */}
            <Text
              style={[
                typography.label,
                { color: palette.textSecondary, marginTop: 14, marginBottom: 6 },
              ]}
            >
              CATEGORY TAG
            </Text>
            <View style={styles.categoryPickerGrid}>
              {CATEGORY_OPTIONS.map((option) => {
                const selected = categoryTag === option.tag;
                const accent = CATEGORY_COLORS[option.tag];
                return (
                  <Pressable
                    key={option.tag}
                    onPress={() => setCategoryTag(option.tag)}
                    style={[
                      styles.categoryPickerCard,
                      {
                        backgroundColor: selected
                          ? `${accent}18`
                          : palette.surfaceElevated,
                        borderColor: selected ? accent : palette.border,
                      },
                    ]}
                  >
                    <View style={styles.categoryPickerHeader}>
                      <Ionicons name={option.icon} size={16} color={accent} />
                      <Text
                        style={[
                          typography.subtitle,
                          { color: palette.text, fontSize: 13, marginLeft: 6 },
                        ]}
                      >
                        {option.tag}
                      </Text>
                    </View>
                    <Text
                      style={[
                        typography.caption,
                        { color: palette.textSecondary, marginTop: 2 },
                      ]}
                    >
                      {option.subtitle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Recurring Toggle */}
            <View
              style={[
                styles.recurringRow,
                {
                  backgroundColor: palette.surfaceElevated,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.subtitle, { color: palette.text }]}>
                  Recurring Task
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: palette.textSecondary },
                  ]}
                >
                  Syncs with green dot indicator on Calendar
                </Text>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{
                  false: palette.border,
                  true: palette.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Multiline Notes */}
            <Text
              style={[
                typography.label,
                { color: palette.textSecondary, marginTop: 14, marginBottom: 6 },
              ]}
            >
              SIDE NOTES
            </Text>
            <TextInput
              value={sideNotes}
              onChangeText={setSideNotes}
              placeholder="Add seat numbers, terminal gate, Setel receipt details, or study chapter notes..."
              placeholderTextColor={palette.textMuted}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: palette.surfaceElevated,
                  color: palette.text,
                  borderColor: palette.border,
                },
              ]}
            />

            {/* Save Button */}
            <Pressable
              onPress={handleSaveTask}
              style={[
                styles.saveButton,
                { backgroundColor: palette.primary },
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {editingTaskId ? 'Update Task' : 'Create Task'}
              </Text>
            </Pressable>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  newTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 4,
  },
  newTaskBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  visualizerCard: {
    marginBottom: 12,
  },
  visualizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
  },
  halfClip: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  halfArc: {
    position: 'absolute',
    top: 0,
  },
  ringCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizerDivider: {
    width: 1,
    height: 76,
    marginHorizontal: 16,
  },
  countdownContainer: {
    flex: 1,
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerBoxesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  timerBox: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerUnitText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  filterBarWrapper: {
    marginBottom: 8,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  gestureHintRow: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 36,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 44,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  prioritySwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryPickerGrid: {
    gap: 8,
  },
  categoryPickerCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default TasksScreen;

