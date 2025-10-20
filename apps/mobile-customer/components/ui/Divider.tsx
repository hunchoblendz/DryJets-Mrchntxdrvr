import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, colors } from '../../theme/tokens';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  margin?: number;
}

export const Divider: React.FC<DividerProps> = ({
  style,
  color = colors.border.light,
  margin = spacing.md,
}) => (
  <View
    style={[
      styles.divider,
      {
        backgroundColor: color,
        marginVertical: margin,
      },
      style,
    ]}
  />
);

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
