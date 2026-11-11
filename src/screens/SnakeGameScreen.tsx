import React, { useMemo } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { useStore } from '../store/useStore';
import { getThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useSnakeEngine } from '../utils/useSnakeEngine';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 32;

export const SnakeGameScreen: React.FC = () => {
  const themeMode = useStore((state) => state.theme);
  const palette = getThemeColors(themeMode);

  const {
    snake,
    food,
    direction,
    score,
    highScore,
    isGameOver,
    isPaused,
    gridSize,
    changeDirection,
    restartGame,
    togglePause,
  } = useSnakeEngine();

  // Mathematically map 2D grid to screen width
  const rawBoardSize = SCREEN_WIDTH - HORIZONTAL_PADDING;
  const cellSize = Math.floor(rawBoardSize / gridSize);
  const boardDimension = cellSize * gridSize;

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(12)
        .onUpdate((event) => {
          const { translationX, translationY } = event;
          if (Math.abs(translationX) > Math.abs(translationY)) {
            if (translationX > 14) {
              runOnJS(changeDirection)('RIGHT');
            } else if (translationX < -14) {
              runOnJS(changeDirection)('LEFT');
            }
          } else {
            if (translationY > 14) {
              runOnJS(changeDirection)('DOWN');
            } else if (translationY < -14) {
              runOnJS(changeDirection)('UP');
            }
          }
        }),
    [changeDirection]
  );

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
              ARCADE MODULE
            </Text>
            <Text style={[typography.h1, { color: palette.text, marginTop: 2 }]}>
              Retro Snake
            </Text>
          </View>

          <View style={styles.controlsTopRow}>
            <Pressable
              onPress={togglePause}
              disabled={isGameOver}
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={18}
                color={palette.primary}
              />
            </Pressable>
            <Pressable
              onPress={restartGame}
              style={[
                styles.iconActionBtn,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Ionicons name="refresh" size={18} color={palette.text} />
            </Pressable>
          </View>
        </View>

        {/* Scoreboard Card */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreCol}>
              <Text
                style={[typography.label, { color: palette.textSecondary }]}
              >
                CURRENT SCORE
              </Text>
              <Text
                style={[
                  typography.hero,
                  { color: palette.primary, marginTop: 2 },
                ]}
              >
                {score}
              </Text>
            </View>

            <View
              style={[
                styles.scoreDivider,
                { backgroundColor: palette.border },
              ]}
            />

            <View style={styles.scoreCol}>
              <View style={styles.highScoreLabelRow}>
                <Ionicons name="trophy" size={13} color={palette.warning} />
                <Text
                  style={[
                    typography.label,
                    { color: palette.warning, marginLeft: 4 },
                  ]}
                >
                  HIGH SCORE
                </Text>
              </View>
              <Text
                style={[typography.hero, { color: palette.text, marginTop: 2 }]}
              >
                {highScore}
              </Text>
            </View>
          </View>
        </Card>

        {/* 2D Grid Game Board wrapped in RNGH v2 GestureDetector */}
        <View style={styles.boardCenterWrapper}>
          <GestureDetector gesture={panGesture}>
            <View
              style={[
                styles.board,
                {
                  width: boardDimension,
                  height: boardDimension,
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              {/* Subtle Grid Lines */}
              {Array.from({ length: gridSize }).map((_, rowIdx) => (
                <View
                  key={`row-${rowIdx}`}
                  style={[
                    styles.gridRowLine,
                    {
                      top: rowIdx * cellSize,
                      height: cellSize,
                      borderBottomColor:
                        themeMode === 'dark'
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(0,0,0,0.03)',
                    },
                  ]}
                />
              ))}

              {/* Food Cell */}
              <View
                style={[
                  styles.foodCell,
                  {
                    width: cellSize - 2,
                    height: cellSize - 2,
                    borderRadius: (cellSize - 2) / 2,
                    left: food.x * cellSize + 1,
                    top: food.y * cellSize + 1,
                    backgroundColor: palette.danger,
                  },
                ]}
              />

              {/* Snake Segments */}
              {snake.map((segment, index) => {
                const isHead = index === 0;
                return (
                  <View
                    key={`seg-${index}-${segment.x}-${segment.y}`}
                    style={[
                      styles.snakeSegment,
                      {
                        width: cellSize - 2,
                        height: cellSize - 2,
                        left: segment.x * cellSize + 1,
                        top: segment.y * cellSize + 1,
                        borderRadius: isHead ? 6 : 4,
                        backgroundColor: isHead
                          ? palette.primary
                          : palette.success,
                        opacity: isHead
                          ? 1
                          : Math.max(0.45, 1 - index * 0.025),
                      },
                    ]}
                  />
                );
              })}

              {/* Pause Overlay */}
              {isPaused && !isGameOver && (
                <View style={styles.overlay}>
                  <Text style={[typography.h1, { color: '#FFFFFF' }]}>
                    PAUSED
                  </Text>
                  <Pressable
                    onPress={togglePause}
                    style={[
                      styles.restartBtn,
                      { backgroundColor: palette.primary },
                    ]}
                  >
                    <Ionicons name="play" size={18} color="#FFFFFF" />
                    <Text style={styles.restartBtnText}>Resume</Text>
                  </Pressable>
                </View>
              )}

              {/* Game Over Overlay */}
              {isGameOver && (
                <View style={styles.overlay}>
                  <Ionicons
                    name="skull-outline"
                    size={42}
                    color={palette.danger}
                  />
                  <Text
                    style={[
                      typography.h1,
                      { color: '#FFFFFF', marginTop: 8 },
                    ]}
                  >
                    Game Over
                  </Text>
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: '#E4E4E7', marginTop: 4 },
                    ]}
                  >
                    Final Score: {score} • Best: {highScore}
                  </Text>

                  <Pressable
                    onPress={restartGame}
                    style={[
                      styles.restartBtn,
                      { backgroundColor: palette.primary },
                    ]}
                  >
                    <Ionicons name="refresh" size={18} color="#FFFFFF" />
                    <Text style={styles.restartBtnText}>Play Again</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </GestureDetector>
        </View>

        {/* Tactile D-Pad + Swipe Instructions */}
        <View style={styles.footerControls}>
          <Text
            style={[
              typography.caption,
              {
                color: palette.textMuted,
                textAlign: 'center',
                marginBottom: 8,
              },
            ]}
          >
            Swipe anywhere on the grid or tap controls ({direction})
          </Text>

          <View style={styles.dpadContainer}>
            <Pressable
              onPress={() => changeDirection('UP')}
              style={[
                styles.dpadBtn,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Ionicons name="chevron-up" size={22} color={palette.text} />
            </Pressable>
            <View style={styles.dpadMiddleRow}>
              <Pressable
                onPress={() => changeDirection('LEFT')}
                style={[
                  styles.dpadBtn,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Ionicons name="chevron-back" size={22} color={palette.text} />
              </Pressable>
              <View style={styles.dpadSpacer} />
              <Pressable
                onPress={() => changeDirection('RIGHT')}
                style={[
                  styles.dpadBtn,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={palette.text}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => changeDirection('DOWN')}
              style={[
                styles.dpadBtn,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Ionicons name="chevron-down" size={22} color={palette.text} />
            </Pressable>
          </View>
        </View>
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
    marginBottom: 10,
  },
  controlsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCard: {
    paddingVertical: 12,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  scoreCol: {
    alignItems: 'center',
  },
  highScoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreDivider: {
    width: 1,
    height: 44,
  },
  boardCenterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    borderWidth: 2,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  gridRowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
  },
  foodCell: {
    position: 'absolute',
  },
  snakeSegment: {
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9, 9, 11, 0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
    gap: 8,
  },
  restartBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  footerControls: {
    marginTop: 12,
    alignItems: 'center',
  },
  dpadContainer: {
    alignItems: 'center',
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dpadSpacer: {
    width: 44,
  },
  dpadBtn: {
    width: 46,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SnakeGameScreen;

