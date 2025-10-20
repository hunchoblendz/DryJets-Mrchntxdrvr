import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { colors, spacing, typography } from '../../theme/tokens';
import { formatCurrency } from '../../lib/utils';
import { promoCodesApi } from '../../lib/api';

interface PromoCodeInputProps {
  appliedCode: { code: string; discount: number } | null;
  subtotal: number;
  onApply: (code: { code: string; discount: number }) => void;
  onRemove: () => void;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  appliedCode,
  subtotal,
  onApply,
  onRemove,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await promoCodesApi.validate(code, subtotal);
      const promoData = response.data.data;

      const discountAmount = promoData.discountType === 'PERCENTAGE'
        ? (subtotal * promoData.discountValue) / 100
        : promoData.discountValue;

      onApply({
        code: promoData.code,
        discount: Math.min(
          discountAmount,
          promoData.maxDiscountAmount || discountAmount
        ),
      });

      setCode('');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Invalid or expired promo code'
      );
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <Card variant="default">
        <View style={styles.appliedContainer}>
          <View style={styles.appliedContent}>
            <View style={styles.appliedHeader}>
              <Text style={styles.appliedLabel}>Promo Code Applied</Text>
              <Badge label={appliedCode.code} variant="success" size="sm" />
            </View>
            <Text style={styles.savingsText}>
              You save {formatCurrency(appliedCode.discount)}
            </Text>
          </View>
          <Button
            title="Remove"
            variant="ghost"
            size="sm"
            onPress={onRemove}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card variant="default">
      <View style={styles.container}>
        <Text style={styles.title}>Have a Promo Code?</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter code"
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase());
              setError('');
            }}
            editable={!loading}
            error={error}
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title={loading ? 'Applying...' : 'Apply Promo'}
          onPress={handleApply}
          loading={loading}
          fullWidth
          variant="secondary"
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error[500],
    marginBottom: spacing.sm,
  },
  appliedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  appliedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  appliedLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success[500],
  },
  savingsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
