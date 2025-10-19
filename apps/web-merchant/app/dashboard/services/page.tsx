'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  AlertCircle,
  DollarSign,
  Clock,
  Tag,
  TrendingUp,
  Percent,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useServices, useToggleServiceStatus } from '@/lib/hooks/useServices';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  'All Categories',
  'Shirts',
  'Pants',
  'Suits',
  'Dresses',
  'Outerwear',
  'Bedding',
  'Alterations',
  'Specialty',
  'Other',
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const { toast } = useToast();

  // TODO: Replace with actual merchant ID from auth
  const merchantId = 'merchant-1';

  // Fetch services
  const { data: services, isLoading, isError, error } = useServices(merchantId);
  const toggleStatusMutation = useToggleServiceStatus(merchantId);

  // Filter services
  const filteredServices = services?.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All Categories' || service.category === categoryFilter;

    return matchesSearch && matchesCategory;
  }) || [];

  // Stats
  const stats = {
    total: services?.length || 0,
    active: services?.filter((s) => s.isActive).length || 0,
    inactive: services?.filter((s) => !s.isActive).length || 0,
    avgPrice: services?.length
      ? (services.reduce((sum, s) => sum + s.basePrice, 0) / services.length).toFixed(2)
      : '0.00',
  };

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync({
        serviceId,
        isActive: !currentStatus,
      });

      toast({
        title: 'Success',
        description: `Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update service status',
        variant: 'error',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Services</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An error occurred while fetching services'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-brand-gradient bg-clip-text text-transparent">
            Services Management
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your service catalog, pricing, and availability
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Services</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-3xl font-bold mt-2 text-muted-foreground">{stats.inactive}</p>
              </div>
              <Percent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Price</p>
                <p className="text-3xl font-bold mt-2">${stats.avgPrice}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background w-full md:w-48"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="outline" className="mt-2">
                      {service.category}
                    </Badge>
                  </div>
                  <Switch
                    checked={service.isActive}
                    onCheckedChange={() => handleToggleStatus(service.id, service.isActive)}
                    disabled={toggleStatusMutation.isPending}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description || 'No description provided'}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Base Price</span>
                    </div>
                    <span className="font-semibold">${service.basePrice.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration</span>
                    </div>
                    <span className="text-sm">{service.estimatedDuration} min</span>
                  </div>

                  {service.pricingTiers && service.pricingTiers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Special Pricing:</p>
                      {service.pricingTiers.map((tier) => (
                        <div key={tier.id} className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {tier.fulfillmentMode.replace(/_/g, ' ')}
                          </span>
                          <span className="text-green-600 font-medium">
                            {tier.priceModifier}% off
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full text-center py-16">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'All Categories'
                ? 'No services match your search criteria'
                : 'No services available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}