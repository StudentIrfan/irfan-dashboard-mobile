import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { useStore } from '../store/useStore';
import { CATEGORY_COLORS, getThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import {
  buildCalendarMarkedDates,
  formatDisplayDate,
  getTodayISO,
} from '../utils/dateUtils';

type SheetMode = 'DAY_AGENDA' | 'CREATE_EVENT';

export const CalendarScreen: React.FC = () => {
  const themeMode = useStore((state) => state.theme);
  const tasks = useStore((state) => state.tasks);
  const calendarEvents = useStore((state) => state.calendarEvents);
  const addEvent = useStore((state) => state.addEvent);
  const deleteEvent = useStore((state) => state.deleteEvent);
  const toggleTaskCompletion = useStore((state) => state.toggleTaskCompletion);

  const palette = getThemeColors(themeMode);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [sheetMode, setSheetMode] = useState<SheetMode>('DAY_AGENDA');

  // Standalone CalendarEvent form state
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('10:00');
  const [eventNotes, setEventNotes] = useState<string>('');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['68%', '85%'], []);

  const markedDates = useMemo(
    () =>
      buildCalendarMarkedDates(
        tasks,
        calendarEvents,
        selectedDate,
        palette.primary
      ),
    [tasks, calendarEvents, selectedDate, palette.primary]
  );

  const dayTasks = useMemo(
    () => tasks.filter((t) => t.date === selectedDate),
    [tasks, selectedDate]
  );

  const dayEvents = useMemo(
    () => calendarEvents.filter((ev) => ev.date === selectedDate),
    [calendarEvents, selectedDate]
  );

  const handleDayPress = useCallback((day: DateData): void => {
    setSelectedDate(day.dateString);
    setSheetMode('DAY_AGENDA');
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleOpenCreateEvent = useCallback((): void => {
    setEventTitle('');
    setEventTime('10:00');
    setEventNotes('');
    setSheetMode('CREATE_EVENT');
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const handleSaveEvent = useCallback((): void => {
    const trimmed = eventTitle.trim();
    if (!trimmed) {
      return;
    }
    addEvent({
      title: trimmed,
      date: selectedDate,
      time: eventTime.trim() || '10:00',
      sideNotes: eventNotes.trim(),
    });
    setSheetMode('DAY_AGENDA');
    bottomSheetRef.current?.snapToIndex(0);
  }, [eventTitle, selectedDate, eventTime, eventNotes, addEvent]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
      />
    ),
    []
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[typography.label, { color: palette.primary }]}>
                SCHEDULE & SYNC
              </Text>
              <Text
                style={[typography.h1, { color: palette.text, marginTop: 2 }]}
              >
                Calendar
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setSheetMode('DAY_AGENDA');
                bottomSheetRef.current?.snapToIndex(0);
              }}
              style={[
                styles.datePill,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={15}
                color={palette.primary}
              />
              <Text
                style={[
                  typography.caption,
                  { color: palette.text, fontWeight: '700', marginLeft: 6 },
                ]}
              >
                {formatDisplayDate(selectedDate)}
              </Text>
            </Pressable>
          </View>

          {/* Monthly Calendar View */}
          <Card noPadding style={styles.calendarCard}>
            <Calendar
              key={themeMode}
              current={selectedDate}
              onDayPress={handleDayPress}
              markingType="multi-dot"
              markedDates={markedDates}
              enableSwipeMonths
              theme={{
                backgroundColor: palette.surface,
                calendarBackground: palette.surface,
                textSectionTitleColor: palette.textSecondary,
                selectedDayBackgroundColor: palette.primary,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: palette.primary,
                dayTextColor: palette.text,
                textDisabledColor: palette.textMuted,
                dotColor: palette.primary,
                selectedDotColor: '#FFFFFF',
                arrowColor: palette.primary,
                monthTextColor: palette.text,
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
              }}
            />
          </Card>

          {/* Legend Card */}
          <Card>
            <Text
              style={[
                typography.label,
                { color: palette.textSecondary, marginBottom: 10 },
              ]}
            >
              MULTI-DOT MARKER LEGEND
            </Text>
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#F97316' }]}
                />
                <Text
                  style={[typography.caption, { color: palette.textSecondary }]}
                >
                  Travel / redBus
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#10B981' }]}
                />
                <Text
                  style={[typography.caption, { color: palette.textSecondary }]}
                >
                  Recurring
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#EF4444' }]}
                />
                <Text
                  style={[typography.caption, { color: palette.textSecondary }]}
                >
                  Urgent Task
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: palette.primary },
                  ]}
                />
                <Text
                  style={[typography.caption, { color: palette.textSecondary }]}
                >
                  Calendar Event
                </Text>
              </View>
            </View>
          </Card>

          {/* Inline Preview for Selected Date */}
          <Card>
            <View style={styles.previewHeaderRow}>
              <View>
                <Text style={[typography.h3, { color: palette.text }]}>
                  {formatDisplayDate(selectedDate)}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: palette.textSecondary, marginTop: 2 },
                  ]}
                >
                  {dayTasks.length} task(s) • {dayEvents.length} event(s)
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setSheetMode('DAY_AGENDA');
                  bottomSheetRef.current?.snapToIndex(0);
                }}
                style={[
                  styles.openSheetButton,
                  { backgroundColor: palette.primarySoft },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: palette.primary, fontWeight: '700' },
                  ]}
                >
                  Open Day Sheet
                </Text>
              </Pressable>
            </View>
          </Card>
        </ScrollView>

        {/* FAB to Add Standalone CalendarEvent */}
        <Pressable
          onPress={handleOpenCreateEvent}
          style={[
            styles.fab,
            {
              backgroundColor: palette.primary,
              shadowColor: palette.cardShadow,
            },
          ]}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>

        {/* Bottom Sheet for Day Agenda & Creating Standalone Events */}
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
            <View style={styles.sheetTopBar}>
              <View>
                <Text style={[typography.label, { color: palette.primary }]}>
                  {sheetMode === 'DAY_AGENDA'
                    ? 'DAILY SCHEDULE'
                    : 'STANDALONE CALENDAR EVENT'}
                </Text>
                <Text
                  style={[typography.h2, { color: palette.text, marginTop: 2 }]}
                >
                  {formatDisplayDate(selectedDate)}
                </Text>
              </View>

              <View style={styles.sheetTopActions}>
                {sheetMode === 'DAY_AGENDA' ? (
                  <Pressable
                    onPress={() => setSheetMode('CREATE_EVENT')}
                    style={[
                      styles.sheetSwitchBtn,
                      { backgroundColor: palette.primary },
                    ]}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.sheetSwitchBtnText}>Add Event</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => setSheetMode('DAY_AGENDA')}
                    style={[
                      styles.sheetSwitchBtn,
                      { backgroundColor: palette.surfaceElevated },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption,
                        { color: palette.text, fontWeight: '700' },
                      ]}
                    >
                      Back to Agenda
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {sheetMode === 'DAY_AGENDA' ? (
              <View style={styles.agendaContainer}>
                {/* Events Section */}
                <Text
                  style={[
                    typography.label,
                    { color: palette.textSecondary, marginBottom: 8 },
                  ]}
                >
                  EVENTS ({dayEvents.length})
                </Text>
                {dayEvents.length === 0 ? (
                  <Text
                    style={[
                      typography.caption,
                      { color: palette.textMuted, marginBottom: 16 },
                    ]}
                  >
                    No standalone events scheduled for this date.
                  </Text>
                ) : (
                  dayEvents.map((ev) => (
                    <View
                      key={ev.id}
                      style={[
                        styles.agendaItem,
                        {
                          backgroundColor: palette.surfaceElevated,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.agendaAccent,
                          { backgroundColor: palette.primary },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={styles.agendaTitleRow}>
                          <Text
                            style={[
                              typography.subtitle,
                              { color: palette.text, flex: 1 },
                            ]}
                          >
                            {ev.title}
                          </Text>
                          <Text
                            style={[
                              typography.mono,
                              { color: palette.primary },
                            ]}
                          >
                            {ev.time}
                          </Text>
                        </View>
                        {ev.sideNotes.length > 0 && (
                          <Text
                            style={[
                              typography.caption,
                              { color: palette.textSecondary, marginTop: 3 },
                            ]}
                          >
                            {ev.sideNotes}
                          </Text>
                        )}
                      </View>
                      <Pressable
                        onPress={() => deleteEvent(ev.id)}
                        style={styles.deleteIconBtn}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={palette.danger}
                        />
                      </Pressable>
                    </View>
                  ))
                )}

                {/* Tasks Section */}
                <Text
                  style={[
                    typography.label,
                    {
                      color: palette.textSecondary,
                      marginTop: 12,
                      marginBottom: 8,
                    },
                  ]}
                >
                  TASKS ({dayTasks.length})
                </Text>
                {dayTasks.length === 0 ? (
                  <Text
                    style={[typography.caption, { color: palette.textMuted }]}
                  >
                    No tasks due on this date.
                  </Text>
                ) : (
                  dayTasks.map((task) => {
                    const catColor = CATEGORY_COLORS[task.categoryTag];
                    return (
                      <Pressable
                        key={task.id}
                        onPress={() => toggleTaskCompletion(task.id)}
                        style={[
                          styles.agendaItem,
                          {
                            backgroundColor: palette.surfaceElevated,
                            borderColor: palette.border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.agendaAccent,
                            { backgroundColor: task.priorityColor },
                          ]}
                        />
                        <Ionicons
                          name={
                            task.isCompleted
                              ? 'checkmark-circle'
                              : 'ellipse-outline'
                          }
                          size={20}
                          color={
                            task.isCompleted
                              ? palette.success
                              : task.priorityColor
                          }
                          style={{ marginRight: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              typography.subtitle,
                              { color: palette.text },
                              task.isCompleted && {
                                textDecorationLine: 'line-through',
                                color: palette.textMuted,
                              },
                            ]}
                          >
                            {task.title}
                          </Text>
                          <View style={styles.agendaTaskMeta}>
                            <Text
                              style={[
                                typography.caption,
                                { color: catColor, fontWeight: '700' },
                              ]}
                            >
                              {task.categoryTag}
                            </Text>
                            <Text
                              style={[
                                typography.caption,
                                { color: palette.textMuted },
                              ]}
                            >
                              • {task.time}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </View>
            ) : (
              /* Create Standalone CalendarEvent Form */
              <View style={styles.formContainer}>
                <Text
                  style={[
                    typography.label,
                    { color: palette.textSecondary, marginBottom: 6 },
                  ]}
                >
                  EVENT TITLE
                </Text>
                <TextInput
                  value={eventTitle}
                  onChangeText={setEventTitle}
                  placeholder="e.g., IIUM JumpStart 2.0 Townhall"
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

                <Text
                  style={[
                    typography.label,
                    {
                      color: palette.textSecondary,
                      marginTop: 14,
                      marginBottom: 6,
                    },
                  ]}
                >
                  TIME (HH:MM)
                </Text>
                <TextInput
                  value={eventTime}
                  onChangeText={setEventTime}
                  placeholder="10:00"
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

                <Text
                  style={[
                    typography.label,
                    {
                      color: palette.textSecondary,
                      marginTop: 14,
                      marginBottom: 6,
                    },
                  ]}
                >
                  SIDE NOTES
                </Text>
                <TextInput
                  value={eventNotes}
                  onChangeText={setEventNotes}
                  placeholder="Location, agenda link, or preparation items..."
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

                <Pressable
                  onPress={handleSaveEvent}
                  style={[
                    styles.saveEventBtn,
                    { backgroundColor: palette.primary },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.saveEventBtnText}>
                    Save Event on {selectedDate}
                  </Text>
                </Pressable>
              </View>
            )}
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  calendarCard: {
    overflow: 'hidden',
    padding: 6,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openSheetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  sheetTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  sheetSwitchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  agendaContainer: {
    marginTop: 4,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  agendaAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 10,
  },
  agendaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  agendaTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  deleteIconBtn: {
    padding: 6,
    marginLeft: 8,
  },
  formContainer: {
    marginTop: 4,
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
  saveEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  saveEventBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default CalendarScreen;

