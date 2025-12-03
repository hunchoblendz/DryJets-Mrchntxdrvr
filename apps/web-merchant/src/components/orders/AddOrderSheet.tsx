'use client';

/**
 * AddOrderSheet - "Dummy User" Friendly 3-Step Wizard Order Creation
 *
 * Features:
 * - 3-step wizard: Customer Info -> Select Items -> Review & Pay
 * - Progressive disclosure for simplified UX
 * - Animated step transitions
 * - Mobile-first responsive design
 * - Cloud-only order creation (requires online connection)
 *
 * @example
 * <AddOrderSheet open={isOpen} onOpenChange={setIsOpen} />
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  CreditCard,
  Clock,
  User,
  ShoppingBag,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  Calendar,
  Check,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderItemTile, type OrderItem } from './OrderItemTile';
import { OrderSummaryTable } from './OrderSummaryTable';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Mock service items data
const SERVICE_ITEMS: OrderItem[] = [
  { id: '1', name: 'Shirt', icon: '👔', price: 8.99, category: 'Clothing' },
  { id: '2', name: 'Dress', icon: '👗', price: 15.0, category: 'Clothing' },
  { id: '3', name: 'Jacket', icon: '🧥', price: 12.0, category: 'Outerwear' },
  { id: '4', name: 'Pants', icon: '👖', price: 10.0, category: 'Clothing' },
  { id: '5', name: 'Skirt', icon: '👘', price: 9.5, category: 'Clothing' },
  { id: '6', name: 'Suit', icon: '🎽', price: 25.0, category: 'Formal' },
  { id: '7', name: 'Bulk Load', icon: '🧺', price: 30.0, category: 'Bulk' },
  { id: '8', name: 'Custom', icon: '✨', price: 0, category: 'Special' },
];

// Step configuration
const STEPS = [
  { id: 'customer', title: 'Customer Info', icon: User, description: 'Enter customer details' },
  { id: 'items', title: 'Select Items', icon: ShoppingBag, description: 'Choose services' },
  { id: 'review', title: 'Review & Pay', icon: CheckCircle, description: 'Confirm order' },
];

interface AddOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOrderSheet({ open, onOpenChange }: AddOrderSheetProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Generate order number
  const [orderNumber] = React.useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DJ-${random}`;
  });

  // Customer info state
  const [customerInfo, setCustomerInfo] = React.useState({
    name: '',
    phone: '',
    pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Order items state (itemId -> quantity)
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  // Reset form when sheet closes
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentStep(0);
        setQuantities({});
        setCustomerInfo({
          name: '',
          phone: '',
          pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }, 300);
    }
  }, [open]);

  // Handle quantity changes
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      const newQuantities = { ...quantities };
      delete newQuantities[itemId];
      setQuantities(newQuantities);
    } else {
      setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const newQuantities = { ...quantities };
    delete newQuantities[itemId];
    setQuantities(newQuantities);
  };

  // Get order line items for summary
  const orderLineItems = Object.entries(quantities).map(([itemId, quantity]) => ({
    item: SERVICE_ITEMS.find((item) => item.id === itemId)!,
    quantity,
  }));

  // Calculate totals
  const subtotal = orderLineItems.reduce(
    (sum, { item, quantity }) => sum + item.price * quantity,
    0
  );
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  // Validation
  const isStep1Valid = customerInfo.name.trim() !== '' && customerInfo.phone.trim() !== '';
  const isStep2Valid = totalItems > 0;

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
    }
  };

  // Submit order
  const handleSubmitOrder = async (payNow: boolean) => {
    setIsSubmitting(true);
    try {
      const order = {
        orderNumber,
        customer: customerInfo,
        items: orderLineItems,
        subtotal,
        tax,
        total,
        paymentStatus: payNow ? 'paid' : 'pending',
        createdAt: new Date().toISOString(),
      };

      // TODO: Call API to create order
      console.log('Order submitted:', order);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Order Created!',
        description: `Order ${orderNumber} has been created successfully.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-xl font-bold">New Order</SheetTitle>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                {orderNumber}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    disabled={index > currentStep}
                    className={cn(
                      'flex flex-col items-center gap-1 transition-all duration-200',
                      index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium hidden sm:block',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      )}
                    >
                      {step.title}
                    </span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: index < currentStep ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 overflow-y-auto p-6"
            >
              {/* Step 1: Customer Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Customer Information
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Enter the customer's details
                    </p>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="h-12 text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={customerInfo.phone}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="h-12 text-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickupDate" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Pickup Date
                      </Label>
                      <Input
                        id="pickupDate"
                        type="date"
                        value={customerInfo.pickupDate}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, pickupDate: e.target.value }))
                        }
                        className="h-12 text-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Select Items */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Select Services
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Tap items to add them to the order
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SERVICE_ITEMS.map((item) => (
                      <OrderItemTile
                        key={item.id}
                        item={item}
                        quantity={quantities[item.id] || 0}
                        onQuantityChange={handleQuantityChange}
                      />
                    ))}
                  </div>

                  {totalItems > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: Review & Pay */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Review Order
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Confirm the order details
                    </p>
                  </div>

                  {/* Customer Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>{customerInfo.name}</p>
                      <p>{customerInfo.phone}</p>
                      <p>Pickup: {new Date(customerInfo.pickupDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <ShoppingBag className="w-4 h-4" />
                      Items ({totalItems})
                    </h3>
                    <OrderSummaryTable
                      items={orderLineItems}
                      onQuantityChange={handleQuantityChange}
                      onRemoveItem={handleRemoveItem}
                    />
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                      <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between gap-3">
            {/* Back Button */}
            {currentStep > 0 ? (
              <Button variant="outline" onClick={goToPrevStep} disabled={isSubmitting}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}

            {/* Next/Submit Buttons */}
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={goToNextStep}
                disabled={
                  (currentStep === 0 && !isStep1Valid) ||
                  (currentStep === 1 && !isStep2Valid)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSubmitOrder(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 mr-1" />
                  )}
                  Pay Later
                </Button>
                <Button
                  onClick={() => handleSubmitOrder(true)}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-1" />
                  )}
                  Pay Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
