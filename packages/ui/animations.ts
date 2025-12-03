/**
 * DryJets UI - Animation Utilities
 *
 * Predefined framer-motion animation variants for consistent animations
 * across the application. Use these for a cohesive user experience.
 */

import { Variants, Transition } from 'framer-motion';

// =============================================================================
// Transitions
// =============================================================================

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

export const quickTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.15,
};

export const bounceTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 15,
};

// =============================================================================
// Fade Variants
// =============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, y: -10 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, y: 10 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
  exit: { opacity: 0, x: -20 },
};

// =============================================================================
// Slide Variants
// =============================================================================

export const slideUp: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: springTransition,
  },
  exit: { y: '100%' },
};

export const slideDown: Variants = {
  hidden: { y: '-100%' },
  visible: {
    y: 0,
    transition: springTransition,
  },
  exit: { y: '-100%' },
};

export const slideLeft: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: springTransition,
  },
  exit: { x: '100%' },
};

export const slideRight: Variants = {
  hidden: { x: '-100%' },
  visible: {
    x: 0,
    transition: springTransition,
  },
  exit: { x: '-100%' },
};

// =============================================================================
// Scale Variants
// =============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: { opacity: 0, scale: 0.8 },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: bounceTransition,
  },
  exit: { opacity: 0, scale: 0.5 },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: { opacity: 0, scale: 0 },
};

// =============================================================================
// Stagger Variants (for lists/grids)
// =============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const staggerChildScale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

// =============================================================================
// Interaction Variants (hover, tap, focus)
// =============================================================================

export const hoverScale = {
  scale: 1.05,
  transition: quickTransition,
};

export const hoverScaleSmall = {
  scale: 1.02,
  transition: quickTransition,
};

export const tapScale = {
  scale: 0.95,
  transition: quickTransition,
};

export const hoverGlow = {
  boxShadow: '0 0 20px rgba(10, 120, 255, 0.3)',
  transition: smoothTransition,
};

// =============================================================================
// Loading/Progress Variants
// =============================================================================

export const pulseAnimation: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

export const spinAnimation: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const progressBar: Variants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

// =============================================================================
// Page Transition Variants
// =============================================================================

export const pageSlideLeft: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const pageSlideRight: Variants = {
  initial: { x: '-100%', opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// Card/Modal Variants
// =============================================================================

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
};

export const cardHover: Variants = {
  initial: {},
  hover: {
    y: -4,
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    transition: smoothTransition,
  },
};

// =============================================================================
// Toast/Notification Variants
// =============================================================================

export const toastSlideIn: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const toastSlideUp: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a stagger container with custom timing
 */
export function createStaggerContainer(
  staggerDelay: number = 0.1,
  delayChildren: number = 0.1
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * Create a custom fade variant with specific duration
 */
export function createFadeVariant(duration: number = 0.3): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration },
    },
    exit: { opacity: 0, transition: { duration: duration * 0.5 } },
  };
}

/**
 * Create a custom slide variant
 */
export function createSlideVariant(
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 20
): Variants {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const value = direction === 'up' || direction === 'left' ? distance : -distance;

  return {
    hidden: { opacity: 0, [axis]: value },
    visible: {
      opacity: 1,
      [axis]: 0,
      transition: smoothTransition,
    },
    exit: { opacity: 0, [axis]: value * -1 },
  };
}
