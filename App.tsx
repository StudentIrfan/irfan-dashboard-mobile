import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { TabNavigator } from './src/navigation/TabNavigator';
import { useStore } from './src/store/useStore';
import { getThemeColors } from './src/theme/colors';

export default function App(): React.JSX.Element {
  const themeMode = useStore((state) => state.theme);
  const palette = getThemeColors(themeMode);

  const navigationTheme: Theme =
    themeMode === 'dark'
      ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: palette.background,
          card: palette.surface,
          text: palette.text,
          border: palette.border,
          primary: palette.primary,
        },
      }
      : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: palette.background,
          card: palette.surface,
          text: palette.text,
          border: palette.border,
          primary: palette.primary,
        },
      };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
            <TabNavigator />
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
