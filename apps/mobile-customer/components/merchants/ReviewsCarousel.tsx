import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { Card } from '../ui/Card';

interface Review {
  id: string;
  customerId: string;
  customer?: {
    user?: {
      firstName: string;
      lastName: string;
    };
  };
  rating: number;
  comment: string | null;
  photos: string[];
  tags: string[];
  createdAt: string;
  merchantResponse: string | null;
}

interface ReviewsCarouselProps {
  reviews: Review[];
  merchantId: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_MARGIN = spacing.md;

export default function ReviewsCarousel({ reviews, merchantId }: ReviewsCarouselProps) {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  if (reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={48} color={colors.text.tertiary} />
        <Text style={styles.emptyTitle}>No reviews yet</Text>
        <Text style={styles.emptyDescription}>
          Be the first to review this merchant
        </Text>
      </View>
    );
  }

  const handleViewAllReviews = () => {
    router.push(`/merchants/${merchantId}/reviews`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Customer Reviews</Text>
        <TouchableOpacity onPress={handleViewAllReviews}>
          <Text style={styles.viewAllText}>
            View All ({reviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={reviews}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        renderItem={({ item }) => <ReviewCard review={item} />}
      />
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const customerName = review.customer?.user
    ? `${review.customer.user.firstName} ${review.customer.user.lastName.charAt(0)}.`
    : 'Anonymous';

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card variant="elevated" style={styles.reviewCard}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {customerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.reviewDate}>{formattedDate}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={colors.warning[500]} />
          <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <View style={styles.photosContainer}>
          {review.photos.slice(0, 3).map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photo}
              resizeMode="cover"
            />
          ))}
          {review.photos.length > 3 && (
            <View style={styles.photoOverlay}>
              <Text style={styles.photoOverlayText}>
                +{review.photos.length - 3}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Comment */}
      {review.comment && (
        <Text style={styles.comment} numberOfLines={4}>
          {review.comment}
        </Text>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Merchant Response */}
      {review.merchantResponse && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Ionicons name="business" size={16} color={colors.primary[500]} />
            <Text style={styles.responseLabel}>Merchant Response</Text>
          </View>
          <Text style={styles.responseText} numberOfLines={3}>
            {review.merchantResponse}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading.h3,
    fontWeight: '700',
    color: colors.text.primary,
  },
  viewAllText: {
    ...typography.body.base,
    color: colors.primary[500],
    fontWeight: '600',
  },
  carouselContent: {
    paddingHorizontal: spacing.md,
  },
  reviewCard: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.body.base,
    fontWeight: '700',
    color: colors.primary[600],
  },
  customerName: {
    ...typography.body.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  reviewDate: {
    ...typography.body.xs,
    color: colors.text.secondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warning[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  ratingText: {
    ...typography.body.sm,
    fontWeight: '700',
    color: colors.warning[700],
  },
  photosContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.secondary,
  },
  photoOverlay: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
  },
  photoOverlayText: {
    ...typography.body.base,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  comment: {
    ...typography.body.base,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary[50],
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  tagText: {
    ...typography.body.xs,
    color: colors.secondary[700],
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  responseLabel: {
    ...typography.body.sm,
    fontWeight: '600',
    color: colors.primary[600],
  },
  responseText: {
    ...typography.body.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyTitle: {
    ...typography.heading.h3,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyDescription: {
    ...typography.body.base,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
