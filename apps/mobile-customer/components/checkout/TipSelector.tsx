import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { formatCurrency } from '../../lib/utils';

interface TipSelectorProps {
  amount: number;
  total: number;
  onSelect: (amount: number) => void;
}

export const TipSelector: React.FC<TipSelectorProps> = ({
  amount,
  total,
  onSelect,
}) => {
  const tipPercentages = [0, 15, 18, 20];
  const customTipAmount = amount > 0 && !tipPercentages.includes(amount)
    ? (amount / total) * 100
    : null;

  const handlePercentageSelect = (percentage: number) => {
    const tipAmount = (total * percentage) / 100;
    onSelect(tipAmount);
  };

  return (
    <Card variant="default">
      <View style={styles.container}>
        <Text style={styles.title}>Add a Tip</Text>
        <Text style={styles.subtitle}>Thank you for supporting your driver!</Text>

        <View style={styles.buttons}>
          {tipPercentages.map((percentage) => (
            <TouchableOpacity
              key={percentage}
              style={[
                styles.button,
                amount === (total * percentage) / 100 && styles.buttonSelected,
              ]}
              onPress={() => handlePercentageSelect(percentage)}
            >
              <Text
                style={[
                  styles.buttonText,
                  amount === (total * percentage) / 100 && styles.buttonTextSelected,
                ]}
              >
                {percentage === 0 ? 'No Tip' : `${percentage}%`}
              </Text>
              <Text
                style={[
                  styles.buttonSubtext,
                  amount === (total * percentage) / 100 && styles.buttonSubtextSelected,
                ]}
              >
                {formatCurrency((total * percentage) / 100)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Custom Tip Button */}
          <TouchableOpacity
            style={[
              styles.button,
              customTipAmount !== null && styles.buttonSelected,
            ]}
            onPress={() => {
              // In a real app, show a text input modal
              // For now, just toggle between preset and custom
              if (customTipAmount !== null) {
                onSelect(0);
              }
            }}
          >
            <Text
              style={[
                styles.buttonText,
                customTipAmount !== null && styles.buttonTextSelected,
              ]}
            >
              Custom
            </Text>
            <Text
              style={[
                styles.buttonSubtext,
                customTipAmount !== null && styles.buttonSubtextSelected,
              ]}
            >
              {customTipAmount !== null
                ? formatCurrency(amount)
                : 'Other'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  buttonTextSelected: {
    color: colors.primary[500],
  },
  buttonSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  buttonSubtextSelected: {
    color: colors.primary[500],
  },
});
