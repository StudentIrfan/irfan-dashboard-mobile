import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useStore } from '../store/useStore';
import { getThemeColors } from '../theme/colors';

export interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = false,
  noPadding = false,
}) => {
  const themeMode = useStore((state) => state.theme);
  const palette = getThemeColors(themeMode);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? palette.surfaceElevated : palette.surface,
          borderColor: palette.border,
          shadowColor: palette.cardShadow,
        },
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 14,
  },
  noPadding: {
    padding: 0,
  },
});

export default Card;

