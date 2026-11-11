import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootTabParamList } from '../types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { SnakeGameScreen } from '../screens/SnakeGameScreen';
import { useStore } from '../store/useStore';
import { getThemeColors } from '../theme/colors';

const Tab = createBottomTabNavigator<RootTabParamList>();

export const TabNavigator: React.FC = () => {
  const themeMode = useStore((state) => state.theme);
  const palette = getThemeColors(themeMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'SnakeGame') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Tab.Screen
        name="SnakeGame"
        component={SnakeGameScreen}
        options={{ title: 'Snake' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

