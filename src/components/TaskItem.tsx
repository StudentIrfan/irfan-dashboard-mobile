import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  GestureEvent,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { useStore } from '../store/useStore';
import { CATEGORY_COLORS, getThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatDisplayDate } from '../utils/dateUtils';

export interface TaskItemProps {
  task: Task;
  onPressEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const SWIPE_COMPLETE_THRESHOLD = 85;
const SWIPE_DELETE_THRESHOLD = -85;

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPressEdit,
  onDelete,
  onToggleComplete,
}) => {
  const themeMode = useStore((state) => state.theme);
  const palette = getThemeColors(themeMode);
  const translateX = useSharedValue<number>(0);

  const handleGestureEvent = (
    event: GestureEvent<PanGestureHandlerEventPayload>
  ): void => {
    const clampedX = Math.max(
      -150,
      Math.min(150, event.nativeEvent.translationX)
    );
    translateX.value = clampedX;
  };

  const handleStateChange = (
    event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ): void => {
    if (
      event.nativeEvent.state === State.END ||
      event.nativeEvent.state === State.CANCELLED ||
      event.nativeEvent.state === State.FAILED
    ) {
      const dragX = event.nativeEvent.translationX;

      if (dragX >= SWIPE_COMPLETE_THRESHOLD) {
        translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
        runOnJS(onToggleComplete)(task.id);
      } else if (dragX <= SWIPE_DELETE_THRESHOLD) {
        translateX.value = withTiming(-360, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(onDelete)(task.id);
          }
        });
      } else {
        translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
      }
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const rightActionAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_COMPLETE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_COMPLETE_THRESHOLD],
      [0.8, 1.05],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const leftActionAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [SWIPE_DELETE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [SWIPE_DELETE_THRESHOLD, 0],
      [1.05, 0.8],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const categoryColor = CATEGORY_COLORS[task.categoryTag];

  return (
    <View style={styles.wrapper}>
      {/* Background swipe indicators */}
      <View style={styles.backdropContainer}>
        <Animated.View
          style={[
            styles.swipeActionLeft,
            { backgroundColor: palette.success },
            rightActionAnimatedStyle,
          ]}
        >
          <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
          <Text style={styles.actionText}>
            {task.isCompleted ? 'Undo' : 'Complete'}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.swipeActionRight,
            { backgroundColor: palette.danger },
            leftActionAnimatedStyle,
          ]}
        >
          <Text style={styles.actionText}>Delete</Text>
          <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
        </Animated.View>
      </View>

      <PanGestureHandler
        activeOffsetX={[-15, 15]}
        failOffsetY={[-15, 15]}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
      >
        <Animated.View
          style={[
            styles.itemCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            cardAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.priorityStrip,
              { backgroundColor: task.priorityColor },
            ]}
          />

          <Pressable
            onPress={() => onToggleComplete(task.id)}
            style={styles.checkboxButton}
            hitSlop={8}
          >
            <Ionicons
              name={task.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={task.isCompleted ? palette.success : task.priorityColor}
            />
          </Pressable>

          <Pressable
            style={styles.contentArea}
            onPress={() => onPressEdit(task)}
          >
            <View style={styles.topRow}>
              <Text
                numberOfLines={1}
                style={[
                  typography.subtitle,
                  { color: palette.text, flex: 1 },
                  task.isCompleted && {
                    textDecorationLine: 'line-through',
                    color: palette.textMuted,
                  },
                ]}
              >
                {task.title}
              </Text>
              {task.isRecurring && (
                <View
                  style={[
                    styles.recurringBadge,
                    { backgroundColor: 'rgba(16, 185, 129, 0.14)' },
                  ]}
                >
                  <Ionicons name="repeat" size={12} color="#10B981" />
                </View>
              )}
            </View>

            {task.sideNotes.trim().length > 0 && (
              <Text
                numberOfLines={2}
                style={[
                  typography.caption,
                  { color: palette.textSecondary, marginTop: 3 },
                ]}
              >
                {task.sideNotes}
              </Text>
            )}

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${categoryColor}20` },
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: categoryColor },
                  ]}
                />
                <Text
                  style={[
                    styles.categoryBadgeText,
                    { color: categoryColor },
                  ]}
                >
                  {task.categoryTag}
                </Text>
              </View>

              <View style={styles.dateTimeChip}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={palette.textMuted}
                />
                <Text
                  style={[
                    typography.caption,
                    { color: palette.textMuted, marginLeft: 4 },
                  ]}
                >
                  {formatDisplayDate(task.date)} • {task.time}
                </Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    position: 'relative',
  },
  backdropContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  swipeActionLeft: {
    height: '100%',
    paddingHorizontal: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swipeActionRight: {
    height: '100%',
    paddingHorizontal: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 12,
    paddingRight: 14,
  },
  priorityStrip: {
    width: 5,
    alignSelf: 'stretch',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    marginRight: 10,
  },
  checkboxButton: {
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    flex: 1,
    marginLeft: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  recurringBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TaskItem;

