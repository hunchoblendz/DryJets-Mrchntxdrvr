import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput as RNTextInput, StyleSheet, Pressable, Animated } from 'react-native';
import { colors, typography, spacing } from '../../theme/tokens';

interface OrderSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  onClear?: () => void;
}

export const OrderSearchBar: React.FC<OrderSearchBarProps> = ({
  onSearch,
  placeholder = 'Search by order #, merchant...',
  debounceMs = 300,
  onClear,
}) => {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearch(searchText);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchText, debounceMs]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleClear = () => {
    setSearchText('');
    onClear?.();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.searchContainer,
          isFocused && styles.searchContainerFocused,
        ]}
      >
        <RNTextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          clearButtonMode="never"
          returnKeyType="search"
        />

        {searchText ? (
          <Pressable
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed,
            ]}
            onPress={handleClear}
          >
            <RNTextInput
              style={styles.clearIcon}
              value="✕"
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
        ) : (
          <RNTextInput
            style={styles.searchIcon}
            value="🔍"
            editable={false}
            pointerEvents="none"
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    height: 44,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainerFocused: {
    borderColor: colors.primary[500],
    shadowOpacity: 0.1,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    height: '100%',
  },
  searchIcon: {
    fontSize: 18,
    width: 20,
    textAlign: 'center',
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  clearButtonPressed: {
    opacity: 0.6,
  },
  clearIcon: {
    fontSize: 18,
    width: 20,
    textAlign: 'center',
    color: colors.text.secondary,
  },
});
