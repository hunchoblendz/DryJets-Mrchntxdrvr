import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../../theme/tokens';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = colors.primary[500],
}) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
