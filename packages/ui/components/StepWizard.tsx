'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  isOptional?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

export interface StepWizardContextValue {
  steps: WizardStep[];
  currentStep: number;
  currentStepData: WizardStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLoading: boolean;
  goToStep: (step: number) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  setCanGoNext: (can: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export interface StepWizardProps {
  steps: WizardStep[];
  children: ReactNode;
  onComplete?: () => void | Promise<void>;
  onStepChange?: (step: number, direction: 'next' | 'prev') => void;
  initialStep?: number;
  className?: string;
  showProgressBar?: boolean;
  allowStepClick?: boolean;
}

export interface StepContentProps {
  step: number;
  children: ReactNode;
}

export interface StepNavigationProps {
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  showPrev?: boolean;
  className?: string;
}

// =============================================================================
// Context
// =============================================================================

const StepWizardContext = createContext<StepWizardContextValue | null>(null);

export function useStepWizard() {
  const context = useContext(StepWizardContext);
  if (!context) {
    throw new Error('useStepWizard must be used within a StepWizard');
  }
  return context;
}

// =============================================================================
// Animation Variants
// =============================================================================

const slideVariants: Variants = {
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

const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.4, ease: 'easeOut' },
  }),
};

// =============================================================================
// Main Component
// =============================================================================

export function StepWizard({
  steps,
  children,
  onComplete,
  onStepChange,
  initialStep = 0,
  className = '',
  showProgressBar = true,
  allowStepClick = false,
}: StepWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const [canGoNext, setCanGoNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setDirection(step > currentStep ? 1 : -1);
        setCurrentStep(step);
      }
    },
    [currentStep, steps.length]
  );

  const nextStep = useCallback(async () => {
    if (!canGoNext || isLoading) return;

    // Validate current step if validator exists
    if (currentStepData.validate) {
      setIsLoading(true);
      try {
        const isValid = await currentStepData.validate();
        if (!isValid) {
          setIsLoading(false);
          return;
        }
      } catch {
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    if (isLastStep) {
      if (onComplete) {
        setIsLoading(true);
        try {
          await onComplete();
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
      onStepChange?.(currentStep + 1, 'next');
    }
  }, [canGoNext, isLoading, currentStepData, isLastStep, onComplete, onStepChange, currentStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep - 1, 'prev');
    }
  }, [isFirstStep, onStepChange, currentStep]);

  const contextValue: StepWizardContextValue = {
    steps,
    currentStep,
    currentStepData,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrev: !isFirstStep,
    isLoading,
    goToStep,
    nextStep,
    prevStep,
    setCanGoNext,
    setIsLoading,
  };

  return (
    <StepWizardContext.Provider value={contextValue}>
      <div className={`step-wizard ${className}`}>
        {/* Progress Bar */}
        {showProgressBar && (
          <div className="mb-8">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  {/* Step Circle */}
                  <button
                    type="button"
                    onClick={() => allowStepClick && index <= currentStep && goToStep(index)}
                    disabled={!allowStepClick || index > currentStep}
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full
                      transition-all duration-300 font-medium text-sm
                      ${
                        index < currentStep
                          ? 'bg-emerald-500 text-white'
                          : index === currentStep
                          ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }
                      ${allowStepClick && index <= currentStep ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                    `}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon || index + 1
                    )}
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{
                          width: index < currentStep ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Step Title & Description */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentStepData.title}
              </h3>
              {currentStepData.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {currentStepData.description}
                </p>
              )}
            </div>

            {/* Progress Percentage Bar */}
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                variants={progressVariants}
                initial="initial"
                animate="animate"
                custom={progress}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        )}

        {/* Step Content */}
        <div className="relative overflow-hidden min-h-[200px]">
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
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </StepWizardContext.Provider>
  );
}

// =============================================================================
// Step Content Component
// =============================================================================

export function StepContent({ step, children }: StepContentProps) {
  const { currentStep } = useStepWizard();

  if (currentStep !== step) {
    return null;
  }

  return <div className="step-content">{children}</div>;
}

// =============================================================================
// Step Navigation Component
// =============================================================================

export function StepNavigation({
  nextLabel = 'Next',
  prevLabel = 'Back',
  completeLabel = 'Complete',
  showPrev = true,
  className = '',
}: StepNavigationProps) {
  const { isFirstStep, isLastStep, canGoNext, isLoading, nextStep, prevStep } = useStepWizard();

  return (
    <div className={`flex items-center justify-between mt-8 ${className}`}>
      {/* Previous Button */}
      {showPrev && !isFirstStep ? (
        <button
          type="button"
          onClick={prevStep}
          disabled={isLoading}
          className="
            flex items-center gap-2 px-4 py-2 text-sm font-medium
            text-gray-600 dark:text-gray-300
            hover:text-gray-900 dark:hover:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          <ChevronLeft className="w-4 h-4" />
          {prevLabel}
        </button>
      ) : (
        <div />
      )}

      {/* Next/Complete Button */}
      <button
        type="button"
        onClick={nextStep}
        disabled={!canGoNext || isLoading}
        className={`
          flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isLastStep
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
          ${canGoNext && !isLoading ? 'hover:scale-105 hover:shadow-lg' : ''}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {isLastStep ? completeLabel : nextLabel}
            {!isLastStep && <ChevronRight className="w-4 h-4" />}
          </>
        )}
      </button>
    </div>
  );
}

// =============================================================================
// Exports
// =============================================================================

export default StepWizard;
