import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, layout } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { merchantsApi } from '../../lib/api';
import { useCartStore, useOrdersStore } from '../../lib/store';
import { formatCurrency } from '../../lib/utils';
import { Service } from '../../types';

export default function MerchantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cartItems, setCartItems] = useState<Map<string, number>>(new Map());
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const { addItem, setMerchantId, setMerchantLocationId } = useCartStore();
  const { setActiveOrder } = useOrdersStore();

  const { data: merchant, isLoading: merchantLoading } = useQuery({
    queryKey: ['merchant', id],
    queryFn: async () => {
      const response = await merchantsApi.getById(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['merchant-locations', id],
    queryFn: async () => {
      const response = await merchantsApi.getLocations(id!);
      return response.data.data || [];
    },
    enabled: !!id,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['merchant-services', id],
    queryFn: async () => {
      const response = await merchantsApi.getServices(id!);
      return response.data.data || [];
    },
    enabled: !!id,
  });

  const { data: reviewsData = { data: [] }, isLoading: reviewsLoading } = useQuery({
    queryKey: ['merchant-reviews', id],
    queryFn: async () => {
      const response = await merchantsApi.getReviews(id!);
      return response.data.data || { data: [] };
    },
    enabled: !!id,
  });

  const reviews = Array.isArray(reviewsData?.data) ? reviewsData.data : [];

  // Set default location
  React.useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      const defaultLocation = locations[0];
      setSelectedLocationId(defaultLocation.id);
    }
  }, [locations, selectedLocationId]);

  const handleAddToCart = (service: Service) => {
    const currentQty = cartItems.get(service.id) || 0;
    const newQty = currentQty + 1;
    setCartItems(new Map(cartItems.set(service.id, newQty)));
  };

  const handleRemoveFromCart = (serviceId: string) => {
    const newCartItems = new Map(cartItems);
    newCartItems.delete(serviceId);
    setCartItems(newCartItems);
  };

  const handleProceedToCart = () => {
    if (!id || cartItems.size === 0 || !selectedLocationId) {
      Alert.alert('Incomplete Selection', 'Please select a location and add items to cart');
      return;
    }

    // Add all items to cart store
    cartItems.forEach((quantity, serviceId) => {
      const service = services.find((s: Service) => s.id === serviceId);
      if (service) {
        for (let i = 0; i < quantity; i++) {
          addItem({
            serviceId: service.id,
            serviceName: service.name,
            quantity: 1,
            unitPrice: service.basePrice,
          });
        }
      }
    });

    setMerchantId(id);
    setMerchantLocationId(selectedLocationId);
    router.push({
      pathname: '/checkout/fulfillment-mode',
      params: { merchantId: id },
    });
  };

  if (merchantLoading || !merchant) {
    return <Loading />;
  }

  const totalItems = Array.from(cartItems.values()).reduce((a, b) => a + b, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Merchant Banner */}
        {merchant.bannerUrl && (
          <Image
            source={{ uri: merchant.bannerUrl }}
            style={styles.banner}
            resizeMode="cover"
          />
        )}

        {/* Merchant Info */}
        <View style={styles.infoSection}>
          <View style={styles.headerRow}>
            {merchant.logoUrl && (
              <Image
                source={{ uri: merchant.logoUrl }}
                style={styles.logo}
              />
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.name}>{merchant.businessName}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>★ {merchant.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({merchant.ratingCount})</Text>
              </View>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.badgesRow}>
            {merchant.verified && <Badge label="Verified" variant="primary" size="sm" />}
            {merchant.ecoFriendly && <Badge label="Eco-friendly" variant="success" size="sm" />}
            {merchant.sameDayService && <Badge label="Same-day" variant="success" size="sm" />}
          </View>

          {merchant.description && (
            <Text style={styles.description}>{merchant.description}</Text>
          )}
        </View>

        {/* Location Selection */}
        {locations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Location</Text>
            {locationsLoading ? (
              <ActivityIndicator size="large" color={colors.primary[500]} />
            ) : (
              locations.map((location: any) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationCard,
                    selectedLocationId === location.id && styles.locationCardSelected,
                  ]}
                  onPress={() => setSelectedLocationId(location.id)}
                >
                  <Card
                    variant={selectedLocationId === location.id ? 'elevated' : 'default'}
                  >
                    <View style={styles.locationContent}>
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>{location.name}</Text>
                        <Text style={styles.locationAddress}>
                          {location.address}
                        </Text>
                        {location.phone && (
                          <Text style={styles.locationPhone}>📞 {location.phone}</Text>
                        )}
                      </View>
                      {selectedLocationId === location.id && (
                        <Badge label="Selected" variant="primary" size="sm" />
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>

          {servicesLoading ? (
            <ActivityIndicator size="large" color={colors.primary[500]} />
          ) : services.length === 0 ? (
            <EmptyState
              title="No services available"
              description="Check back soon for services"
            />
          ) : (
            services.map((service: Service) => (
              <ServiceCard
                key={service.id}
                service={service}
                quantity={cartItems.get(service.id) || 0}
                onAdd={() => handleAddToCart(service)}
                onRemove={() => handleRemoveFromCart(service.id)}
              />
            ))
          )}
        </View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {reviews.slice(0, 3).map((review: any) => (
              <Card key={review.id} variant="outlined" style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewRating}>★ {review.rating}/5</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Cart Button */}
      {totalItems > 0 && (
        <View style={styles.cartFooter}>
          <Button
            title={`Proceed to Cart (${totalItems} items)`}
            onPress={handleProceedToCart}
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function ServiceCard({
  service,
  quantity,
  onAdd,
  onRemove,
}: {
  service: Service;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <Card variant="default" style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.servicePrice}>
            {formatCurrency(service.basePrice)}/{service.unit}
          </Text>
          {service.estimatedTurnaround > 0 && (
            <Text style={styles.estimatedTime}>
              ~{service.estimatedTurnaround}h turnaround
            </Text>
          )}
        </View>

        {quantity === 0 ? (
          <Button
            title="Add"
            onPress={onAdd}
            variant="primary"
            size="sm"
          />
        ) : (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={onRemove}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={onAdd}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    padding: layout.screenPadding,
    marginTop: spacing.md,
  },
  backText: {
    fontSize: typography.fontSize.base,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.semibold,
  },
  banner: {
    width: '100%',
    height: 200,
  },
  infoSection: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[200],
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  rating: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning[500],
  },
  reviewCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  locationCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
  },
  locationCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  locationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  locationAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  locationPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  serviceCard: {
    marginBottom: spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  serviceName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  servicePrice: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xs,
  },
  estimatedTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  quantityText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewRating: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning[500],
  },
  reviewDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  reviewComment: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },
  cartFooter: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
});
