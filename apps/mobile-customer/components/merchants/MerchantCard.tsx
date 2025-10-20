import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Merchant } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { spacing, typography, colors, borderRadius } from '../../theme/tokens';

interface MerchantCardProps {
  merchant: Merchant & { distance?: number };
  onPress: () => void;
  style?: ViewStyle;
}

export const MerchantCard: React.FC<MerchantCardProps> = ({ merchant, onPress, style }) => {
  const renderBadges = () => {
    const badges = [];
    if (merchant.verified) badges.push('Verified');
    if (merchant.ecoFriendly) badges.push('Eco-friendly');
    if (merchant.sameDayService) badges.push('Same-day');
    return badges;
  };

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Card variant="elevated">
        {/* Banner Image */}
        {merchant.bannerUrl && (
          <Image
            source={{ uri: merchant.bannerUrl }}
            style={styles.banner}
            resizeMode="cover"
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {merchant.logoUrl && (
              <Image source={{ uri: merchant.logoUrl }} style={styles.logo} resizeMode="cover" />
            )}
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {merchant.businessName}
            </Text>
            <Text style={styles.type}>{merchant.businessType}</Text>
          </View>
        </View>

        {/* Rating & Distance */}
        <View style={styles.metaInfo}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {merchant.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({merchant.ratingCount})</Text>
          </View>

          {merchant.distance && (
            <Text style={styles.distance}>{merchant.distance.toFixed(1)} mi</Text>
          )}
        </View>

        {/* Price Range */}
        <Text style={styles.priceRange}>{merchant.priceRange}</Text>

        {/* Badges */}
        {renderBadges().length > 0 && (
          <View style={styles.badgesContainer}>
            {renderBadges().map((badge, idx) => (
              <Badge key={idx} label={badge} variant="primary" size="sm" />
            ))}
          </View>
        )}

        {/* Description */}
        {merchant.description && (
          <Text style={styles.description} numberOfLines={2}>
            {merchant.description}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  type: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning[500],
    marginRight: spacing.xs,
  },
  reviewCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  distance: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  priceRange: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
