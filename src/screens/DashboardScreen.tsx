import React, { useEffect } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { useStore } from '../store/useStore';
import { getThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { calculateWeeklyTaskStats } from '../utils/dateUtils';

interface DigitalProfileItem {
  id: string;
  platform: string;
  handle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  url?: string;
}

interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  badgeColor: string;
}

const DIGITAL_PROFILES: readonly DigitalProfileItem[] = [
  {
    id: 'github',
    platform: 'GitHub',
    handle: '@irfan-rushdi',
    icon: 'logo-github',
    accentColor: '#A855F7',
    url: 'https://github.com',
  },
  {
    id: 'steam',
    platform: 'Steam ID',
    handle: 'zuboss_punch',
    icon: 'game-controller-outline',
    accentColor: '#3B82F6',
  },
  {
    id: 'roblox',
    platform: 'Roblox',
    handle: 'ZubossPun',
    icon: 'cube-outline',
    accentColor: '#EF4444',
  },
  {
    id: 'genshin',
    platform: 'Genshin UID',
    handle: '804921837 (Asia)',
    icon: 'sparkles-outline',
    accentColor: '#F59E0B',
  },
] as const;

const ACHIEVEMENTS: readonly AchievementItem[] = [
  {
    id: 'deans-list',
    title: "Dean's List (2024/2025)",
    subtitle: 'Academic Excellence • Kulliyyah of ICT',
    icon: 'trophy-outline',
    badgeColor: '#F59E0B',
  },
  {
    id: 'ccna',
    title: 'CCNA (Cisco)',
    subtitle: 'Enterprise Networking, Security & Automation',
    icon: 'hardware-chip-outline',
    badgeColor: '#06B6D4',
  },
  {
    id: 'jumpstart',
    title: 'IIUM JumpStart 2.0',
    subtitle: 'Leadership & Tech Career Accelerator',
    icon: 'rocket-outline',
    badgeColor: '#6366F1',
  },
  {
    id: 'cyberskills',
    title: 'Cyber Skills Level-Up IIUM',
    subtitle: 'Offensive & Defensive Security Track',
    icon: 'shield-checkmark-outline',
    badgeColor: '#10B981',
  },
] as const;

export const DashboardScreen: React.FC = () => {
  const themeMode = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const tasks = useStore((state) => state.tasks);
  const subscriptions = useStore((state) => state.subscriptions);
  const snakeHighScore = useStore((state) => state.snakeHighScore);

  const palette = getThemeColors(themeMode);
  const weeklyStats = calculateWeeklyTaskStats(tasks);

  const progressWidth = useSharedValue<number>(0);

  useEffect(() => {
    progressWidth.value = withSpring(weeklyStats.percentage, {
      damping: 18,
      stiffness: 120,
    });
  }, [weeklyStats.percentage, progressWidth]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progressWidth.value))}%`,
  }));

  const totalMonthlySubs = subscriptions.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const handleEmailPress = (): void => {
    void Linking.openURL('mailto:irfan.rushdi@live.iium.edu.my');
  };

  const handleWahedPress = (): void => {
    void Linking.openURL('https://www.wahedinvest.com');
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Command Header */}
        <View style={styles.topHeaderRow}>
          <View>
            <Text style={[typography.label, { color: palette.primary }]}>
              PERSONAL COMMAND CENTER
            </Text>
            <Text style={[typography.h1, { color: palette.text, marginTop: 2 }]}>
              Dashboard
            </Text>
          </View>

          <Pressable
            onPress={toggleTheme}
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <Ionicons
              name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={palette.primary}
            />
          </Pressable>
        </View>

        {/* 1. Profile Header Card */}
        <Card>
          <View style={styles.profileRow}>
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor: palette.primarySoft,
                  borderColor: palette.primary,
                },
              ]}
            >
              <Text style={[typography.h1, { color: palette.primary }]}>
                MI
              </Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: palette.success,
                    borderColor: palette.surface,
                  },
                ]}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text style={[typography.h2, { color: palette.text }]}>
                Muhammad Irfan bin Rushdi
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: palette.textSecondary, marginTop: 2 },
                ]}
              >
                CS Undergraduate • Network & Security Enthusiast
              </Text>

              <View style={styles.profileActions}>
                <Pressable
                  onPress={handleEmailPress}
                  style={[
                    styles.emailButton,
                    { backgroundColor: palette.primary },
                  ]}
                >
                  <Ionicons name="mail-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.emailButtonText}>Contact via Email</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Card>

        {/* 2. Quick Stats (Dynamic Reanimated Progress Bar) */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons
                name="stats-chart-outline"
                size={18}
                color={palette.primary}
              />
              <Text style={[typography.h3, { color: palette.text }]}>
                Quick Stats
              </Text>
            </View>
            <View
              style={[
                styles.scorePill,
                { backgroundColor: palette.primarySoft },
              ]}
            >
              <Ionicons
                name="game-controller"
                size={12}
                color={palette.primary}
              />
              <Text
                style={[
                  typography.caption,
                  { color: palette.primary, fontWeight: '700', marginLeft: 4 },
                ]}
              >
                Snake Best: {snakeHighScore}
              </Text>
            </View>
          </View>

          <View style={styles.progressHeader}>
            <Text style={[typography.bodyMedium, { color: palette.textSecondary }]}>
              Tasks Completed This Week
            </Text>
            <Text style={[typography.mono, { color: palette.text }]}>
              {weeklyStats.completedCount}/{weeklyStats.totalCount} (
              {weeklyStats.percentage}%)
            </Text>
          </View>

          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: palette.surfaceElevated },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBarFill,
                { backgroundColor: palette.primary },
                animatedProgressStyle,
              ]}
            />
          </View>
        </Card>

        {/* 3. Academic & Campus Card */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons
                name="school-outline"
                size={18}
                color={palette.primary}
              />
              <Text style={[typography.h3, { color: palette.text }]}>
                Academic & Campus
              </Text>
            </View>
            <View
              style={[
                styles.campusBadge,
                { backgroundColor: 'rgba(16, 185, 129, 0.14)' },
              ]}
            >
              <Text style={styles.campusBadgeText}>IIUM Gombak</Text>
            </View>
          </View>

          <Text
            style={[
              typography.bodyMedium,
              { color: palette.text, marginTop: 8 },
            ]}
          >
            Bachelor in Computer Science at IIUM. Residence: Mahallah Uthman / Ruqayyah.
          </Text>

          <View
            style={[
              styles.campusMetaGrid,
              { borderTopColor: palette.border },
            ]}
          >
            <View style={styles.campusMetaItem}>
              <Ionicons
                name="business-outline"
                size={15}
                color={palette.textSecondary}
              />
              <Text
                style={[
                  typography.caption,
                  { color: palette.textSecondary, marginLeft: 6 },
                ]}
              >
                Kulliyyah of ICT (KICT)
              </Text>
            </View>
            <View style={styles.campusMetaItem}>
              <Ionicons
                name="location-outline"
                size={15}
                color={palette.textSecondary}
              />
              <Text
                style={[
                  typography.caption,
                  { color: palette.textSecondary, marginLeft: 6 },
                ]}
              >
                Mahallah Uthman / Ruqayyah
              </Text>
            </View>
          </View>
        </Card>

        {/* 4. Digital Profiles Card */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons
                name="globe-outline"
                size={18}
                color={palette.primary}
              />
              <Text style={[typography.h3, { color: palette.text }]}>
                Digital Profiles
              </Text>
            </View>
          </View>

          <View style={styles.profilesList}>
            {DIGITAL_PROFILES.map((item, idx) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (item.url) {
                    void Linking.openURL(item.url);
                  }
                }}
                style={[
                  styles.digitalRow,
                  idx < DIGITAL_PROFILES.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: palette.border,
                  },
                ]}
              >
                <View style={styles.digitalLeft}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: `${item.accentColor}20` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={item.accentColor}
                    />
                  </View>
                  <Text
                    style={[
                      typography.bodyMedium,
                      { color: palette.text, marginLeft: 10 },
                    ]}
                  >
                    {item.platform}
                  </Text>
                </View>

                <View style={styles.digitalRight}>
                  <Text
                    style={[
                      typography.mono,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {item.handle}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={palette.textMuted}
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* 5. Achievements & Leadership Card */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons
                name="ribbon-outline"
                size={18}
                color={palette.primary}
              />
              <Text style={[typography.h3, { color: palette.text }]}>
                Achievements & Leadership
              </Text>
            </View>
          </View>

          <View style={styles.achievementsContainer}>
            {ACHIEVEMENTS.map((ach) => (
              <View
                key={ach.id}
                style={[
                  styles.achievementTile,
                  {
                    backgroundColor: palette.surfaceElevated,
                    borderColor: palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: `${ach.badgeColor}22` },
                  ]}
                >
                  <Ionicons
                    name={ach.icon}
                    size={18}
                    color={ach.badgeColor}
                  />
                </View>
                <View style={styles.achievementTextCol}>
                  <Text style={[typography.subtitle, { color: palette.text }]}>
                    {ach.title}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: palette.textSecondary, marginTop: 2 },
                    ]}
                  >
                    {ach.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* 6. Finance & Subs (Mapped to Zustand) */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={palette.primary}
              />
              <Text style={[typography.h3, { color: palette.text }]}>
                Finance & Subs
              </Text>
            </View>
            <Text style={[typography.mono, { color: palette.primary }]}>
              RM {totalMonthlySubs.toFixed(2)}/mo
            </Text>
          </View>

          {/* Wahed Invest Shortcut Button */}
          <Pressable
            onPress={handleWahedPress}
            style={[
              styles.wahedButton,
              {
                backgroundColor: palette.primarySoft,
                borderColor: palette.primary,
              },
            ]}
          >
            <View style={styles.wahedLeft}>
              <View
                style={[
                  styles.wahedIconBox,
                  { backgroundColor: palette.primary },
                ]}
              >
                <Ionicons name="trending-up" size={18} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[typography.subtitle, { color: palette.text }]}>
                  Wahed Invest Portfolio
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: palette.textSecondary },
                  ]}
                >
                  Shariah-Compliant Robo-Advisor Shortcut
                </Text>
              </View>
            </View>
            <Ionicons
              name="open-outline"
              size={18}
              color={palette.primary}
            />
          </Pressable>

          {/* Subscriptions List */}
          <View style={styles.subsList}>
            {subscriptions.map((sub, index) => (
              <View
                key={sub.id}
                style={[
                  styles.subRow,
                  index < subscriptions.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: palette.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[typography.subtitle, { color: palette.text }]}>
                    {sub.name}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: palette.textSecondary, marginTop: 2 },
                    ]}
                  >
                    {sub.platform} • Due: {sub.dueDate}
                  </Text>
                </View>

                <View
                  style={[
                    styles.amountChip,
                    { backgroundColor: palette.surfaceElevated },
                  ]}
                >
                  <Text style={[typography.mono, { color: palette.text }]}>
                    RM {sub.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  themeToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  campusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  campusBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  campusMetaGrid: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  campusMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilesList: {
    marginTop: 2,
  },
  digitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  digitalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitalRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  achievementsContainer: {
    gap: 10,
    marginTop: 4,
  },
  achievementTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  achievementTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  wahedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  wahedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wahedIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subsList: {
    marginTop: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 10,
  },
  amountChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});

export default DashboardScreen;

