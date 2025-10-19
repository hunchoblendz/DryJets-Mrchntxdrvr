/**
 * Services API Client
 * Handles all service-related API calls for merchants
 */

import { apiClient } from './client';

export interface Service {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  basePrice: number;
  category: string;
  estimatedDuration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  pricingTiers?: ServicePricingTier[];
}

export interface ServicePricingTier {
  id: string;
  serviceId: string;
  fulfillmentMode: 'FULL_SERVICE' | 'CUSTOMER_DROPOFF_PICKUP' | 'CUSTOMER_DROPOFF_DRIVER_DELIVERY' | 'DRIVER_PICKUP_CUSTOMER_PICKUP';
  priceModifier: number; // percentage (e.g., -10 for 10% discount, 0 for no change)
  deliveryFeeModifier: number; // percentage (e.g., -100 for $0, -50 for 50% off)
}

export interface CreateServiceDTO {
  name: string;
  description?: string;
  basePrice: number;
  category: string;
  estimatedDuration: number;
  isActive?: boolean;
  pricingTiers?: Omit<ServicePricingTier, 'id' | 'serviceId'>[];
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {}

/**
 * Mock services data for development
 */
function getMockServices(merchantId: string): Service[] {
  return [
    {
      id: '1',
      merchantId,
      name: 'Dress Shirt - Wash & Press',
      description: 'Professional cleaning and pressing of dress shirts',
      basePrice: 8.99,
      category: 'Shirts',
      estimatedDuration: 120,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      pricingTiers: [
        {
          id: '1',
          serviceId: '1',
          fulfillmentMode: 'CUSTOMER_DROPOFF_PICKUP',
          priceModifier: -10,
          deliveryFeeModifier: -100,
        },
      ],
    },
    {
      id: '2',
      merchantId,
      name: 'Dress Pants - Dry Clean',
      description: 'Dry cleaning for dress pants and trousers',
      basePrice: 12.99,
      category: 'Pants',
      estimatedDuration: 180,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      merchantId,
      name: 'Suit (2-piece) - Dry Clean',
      description: 'Complete dry cleaning for 2-piece suits',
      basePrice: 24.99,
      category: 'Suits',
      estimatedDuration: 240,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '4',
      merchantId,
      name: 'Dress - Dry Clean',
      description: 'Dry cleaning for dresses and gowns',
      basePrice: 18.99,
      category: 'Dresses',
      estimatedDuration: 180,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '5',
      merchantId,
      name: 'Bedding - Comforter (Queen)',
      description: 'Professional cleaning for queen-size comforters',
      basePrice: 35.00,
      category: 'Bedding',
      estimatedDuration: 300,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '6',
      merchantId,
      name: 'Alterations - Basic Hemming',
      description: 'Basic hemming services for pants or skirts',
      basePrice: 15.00,
      category: 'Alterations',
      estimatedDuration: 60,
      isActive: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
  ];
}

/**
 * Get all services for a merchant
 */
export async function getServices(merchantId: string): Promise<Service[]> {
  try {
    const response = await apiClient.get<Service[]>(`/api/v1/merchants/${merchantId}/services`);

    return response.data.map(service => ({
      ...service,
      createdAt: new Date(service.createdAt),
      updatedAt: new Date(service.updatedAt),
    }));
  } catch (error: any) {
    // Fallback to mock data if API is not available
    if (error.response?.status === 401 || error.response?.status === 404 || !error.response) {
      console.warn('Using mock services data (API requires authentication or is unavailable)');
      return getMockServices(merchantId);
    }
    throw error;
  }
}

/**
 * Get a single service by ID
 */
export async function getServiceById(merchantId: string, serviceId: string): Promise<Service> {
  try {
    const response = await apiClient.get<Service>(`/api/v1/merchants/${merchantId}/services/${serviceId}`);

    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 404 || !error.response) {
      console.warn(`Using mock service data for ID ${serviceId}`);
      const mockServices = getMockServices(merchantId);
      const service = mockServices.find(s => s.id === serviceId);
      if (!service) throw new Error('Service not found');
      return service;
    }
    throw error;
  }
}

/**
 * Create a new service
 */
export async function createService(merchantId: string, data: CreateServiceDTO): Promise<Service> {
  const response = await apiClient.post<Service>(`/api/v1/merchants/${merchantId}/services`, data);

  return {
    ...response.data,
    createdAt: new Date(response.data.createdAt),
    updatedAt: new Date(response.data.updatedAt),
  };
}

/**
 * Update an existing service
 */
export async function updateService(
  merchantId: string,
  serviceId: string,
  data: UpdateServiceDTO
): Promise<Service> {
  const response = await apiClient.patch<Service>(
    `/api/v1/merchants/${merchantId}/services/${serviceId}`,
    data
  );

  return {
    ...response.data,
    createdAt: new Date(response.data.createdAt),
    updatedAt: new Date(response.data.updatedAt),
  };
}

/**
 * Delete a service
 */
export async function deleteService(merchantId: string, serviceId: string): Promise<void> {
  await apiClient.delete(`/api/v1/merchants/${merchantId}/services/${serviceId}`);
}

/**
 * Toggle service active status
 */
export async function toggleServiceStatus(
  merchantId: string,
  serviceId: string,
  isActive: boolean
): Promise<Service> {
  return updateService(merchantId, serviceId, { isActive });
}