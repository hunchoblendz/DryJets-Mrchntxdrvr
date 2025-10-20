import React, { useState } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  editable = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error
              ? colors.error[500]
              : isFocused
                ? colors.primary[500]
                : colors.border.light,
          },
        ]}
      >
        {icon && <View style={styles.leftIcon}>{icon}</View>}

        <RNTextInput
          {...props}
          style={[styles.input, { color: editable ? colors.text.primary : colors.text.tertiary }]}
          placeholderTextColor={colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!editable}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  leftIcon: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
});
