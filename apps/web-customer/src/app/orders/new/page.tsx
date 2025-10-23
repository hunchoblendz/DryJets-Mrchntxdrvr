'use client';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type OrderStep = 'service' | 'items' | 'schedule' | 'review';

interface OrderItem {
  type: string;
  quantity: number;
  specialInstructions?: string;
}

interface Address {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OrderStep>('service');
  const [serviceType, setServiceType] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState<OrderItem>({
    type: '',
    quantity: 1,
    specialInstructions: '',
  });
  const [pickupAddress, setPickupAddress] = useState<Address>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [sameAsPickup, setSameAsPickup] = useState(true);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const createOrderMutation = trpc.orders.createOrder.useMutation({
    onSuccess: (data) => {
      router.push(`/orders/${data.id}`);
    },
    onError: (error) => {
      alert('Failed to create order: ' + error.message);
    },
  });

  const handleAddItem = () => {
    if (newItem.type && newItem.quantity > 0) {
      setItems([...items, newItem]);
      setNewItem({ type: '', quantity: 1, specialInstructions: '' });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const deliveryDate = new Date(pickupDate);
    deliveryDate.setDate(deliveryDate.getDate() + 2);

    createOrderMutation.mutate({
      serviceType,
      items,
      pickupAddress,
      deliveryAddress: sameAsPickup ? pickupAddress : deliveryAddress,
      pickupDate,
      pickupTimeSlot,
      deliveryDate: deliveryDate.toISOString().split('T')[0],
      specialInstructions,
    });
  };

  const canProceedToItems = serviceType !== '';
  const canProceedToSchedule = items.length > 0;
  const canProceedToReview =
    pickupAddress.street &&
    pickupAddress.city &&
    pickupAddress.state &&
    pickupAddress.zipCode &&
    pickupDate &&
    pickupTimeSlot;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p className="mt-1 text-sm text-gray-600">
            Follow the steps to schedule your dry cleaning pickup
          </p>
        </div>

        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol className="flex items-center">
            {[
              { id: 'service', name: 'Service' },
              { id: 'items', name: 'Items' },
              { id: 'schedule', name: 'Schedule' },
              { id: 'review', name: 'Review' },
            ].map((step, stepIdx) => (
              <li
                key={step.id}
                className={`${
                  stepIdx !== 3 ? 'pr-8 sm:pr-20' : ''
                } relative flex-1`}
              >
                <div className="flex items-center">
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStep === step.id
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span className="text-white text-sm font-medium">
                      {stepIdx + 1}
                    </span>
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-900">
                    {step.name}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <div className="bg-white shadow rounded-lg p-6">
          {/* Step 1: Service Selection */}
          {currentStep === 'service' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                Select Service Type
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { id: 'dry-cleaning', name: 'Dry Cleaning', icon: '👔' },
                  { id: 'laundry', name: 'Laundry', icon: '👕' },
                  { id: 'alterations', name: 'Alterations', icon: '✂️' },
                  { id: 'special-care', name: 'Special Care', icon: '⭐' },
                ].map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setServiceType(service.id)}
                    className={`relative rounded-lg border-2 p-6 flex flex-col items-center text-center ${
                      serviceType === service.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-4xl mb-2">{service.icon}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {service.name}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep('items')}
                  disabled={!canProceedToItems}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Item Details */}
          {currentStep === 'items' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Add Items</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Item Type
                    </label>
                    <select
                      value={newItem.type}
                      onChange={(e) =>
                        setNewItem({ ...newItem, type: e.target.value })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="shirt">Shirt</option>
                      <option value="pants">Pants</option>
                      <option value="dress">Dress</option>
                      <option value="suit">Suit</option>
                      <option value="coat">Coat</option>
                      <option value="sweater">Sweater</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddItem}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Special Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={newItem.specialInstructions}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        specialInstructions: e.target.value,
                      })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Extra starch, gentle cleaning"
                  />
                </div>
              </div>

              {items.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Added Items ({items.length})
                  </h3>
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <div>
                          <span className="font-medium capitalize">
                            {item.type}
                          </span>{' '}
                          x {item.quantity}
                          {item.specialInstructions && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({item.specialInstructions})
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('service')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('schedule')}
                  disabled={!canProceedToSchedule}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pickup & Delivery */}
          {currentStep === 'schedule' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                Pickup & Delivery
              </h2>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Pickup Address
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={pickupAddress.street}
                      onChange={(e) =>
                        setPickupAddress({
                          ...pickupAddress,
                          street: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Apt/Suite (Optional)
                    </label>
                    <input
                      type="text"
                      value={pickupAddress.apartment}
                      onChange={(e) =>
                        setPickupAddress({
                          ...pickupAddress,
                          apartment: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={pickupAddress.city}
                      onChange={(e) =>
                        setPickupAddress({
                          ...pickupAddress,
                          city: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      value={pickupAddress.state}
                      onChange={(e) =>
                        setPickupAddress({
                          ...pickupAddress,
                          state: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={pickupAddress.zipCode}
                      onChange={(e) =>
                        setPickupAddress({
                          ...pickupAddress,
                          zipCode: e.target.value,
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Schedule Pickup
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Time Slot
                      </label>
                      <select
                        value={pickupTimeSlot}
                        onChange={(e) => setPickupTimeSlot(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select time slot</option>
                        <option value="9-12">9:00 AM - 12:00 PM</option>
                        <option value="12-3">12:00 PM - 3:00 PM</option>
                        <option value="3-6">3:00 PM - 6:00 PM</option>
                        <option value="6-9">6:00 PM - 9:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameAsPickup}
                    onChange={(e) => setSameAsPickup(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Delivery address same as pickup
                  </label>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('items')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('review')}
                  disabled={!canProceedToReview}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                Review Your Order
              </h2>

              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Service Type</h3>
                  <p className="mt-1 text-sm text-gray-700 capitalize">
                    {serviceType.replace('-', ' ')}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Items ({items.length})
                  </h3>
                  <ul className="mt-1 text-sm text-gray-700 space-y-1">
                    {items.map((item, index) => (
                      <li key={index} className="capitalize">
                        {item.type} x {item.quantity}
                        {item.specialInstructions && ` (${item.specialInstructions})`}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Pickup</h3>
                  <p className="mt-1 text-sm text-gray-700">
                    {pickupAddress.street}
                    {pickupAddress.apartment && `, ${pickupAddress.apartment}`}
                    <br />
                    {pickupAddress.city}, {pickupAddress.state}{' '}
                    {pickupAddress.zipCode}
                    <br />
                    {new Date(pickupDate).toLocaleDateString()} at{' '}
                    {pickupTimeSlot.replace('-', ':00 - ')}:00
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Estimated Delivery
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">
                    {new Date(
                      new Date(pickupDate).getTime() + 2 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requests or notes for the driver"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('schedule')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={createOrderMutation.isPending}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createOrderMutation.isPending}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {createOrderMutation.isPending
                    ? 'Creating...'
                    : 'Confirm Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
