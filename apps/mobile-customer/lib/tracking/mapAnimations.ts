import { Animated, Easing } from 'react-native';

/**
 * Smooth marker position animation
 * Animates a marker from one location to another with easing
 */
export const animateMarkerPosition = (
  animatedValue: Animated.ValueXY,
  newLocation: { x: number; y: number },
  duration: number = 500
) => {
  Animated.timing(animatedValue, {
    toValue: newLocation,
    duration,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    useNativeDriver: false,
  }).start();
};

/**
 * Pulsing scale animation for driver marker
 * Creates a continuous pulsing effect to indicate live tracking
 */
export const createPulseAnimation = () => {
  const pulse = new Animated.Value(1);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.3,
          duration: 750,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return { pulse, startPulse };
};

/**
 * Opacity fade-in animation
 * Used for smooth component appearance
 */
export const createFadeInAnimation = (duration: number = 300) => {
  const opacity = new Animated.Value(0);

  const startFadeIn = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return { opacity, startFadeIn };
};

/**
 * Slide-up animation for bottom sheet
 * Used for driver profile card appearance
 */
export const createSlideUpAnimation = (duration: number = 300) => {
  const slideY = new Animated.Value(300);

  const startSlideUp = () => {
    Animated.timing(slideY, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return { slideY, startSlideUp };
};

/**
 * Bounce animation for marker selection
 * Creates a bounce effect when user taps a marker
 */
export const createBounceAnimation = () => {
  const scale = new Animated.Value(1);

  const startBounce = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scale, startBounce };
};

/**
 * Rotate animation for vehicle direction indicator
 * Rotates to match driver's current heading
 */
export const createRotationAnimation = (
  targetRotation: number,
  duration: number = 300
) => {
  const rotation = new Animated.Value(0);

  const animate = () => {
    Animated.timing(rotation, {
      toValue: targetRotation,
      duration,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const rotationInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return { rotationInterpolate, animate };
};

/**
 * Progress bar fill animation
 * Used for ETA progress bar
 */
export const createProgressAnimation = (
  targetProgress: number,
  duration: number = 1000
) => {
  const progress = new Animated.Value(0);

  const animate = () => {
    Animated.timing(progress, {
      toValue: targetProgress,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  return { progress, animate };
};

/**
 * Opacity blink animation for status indicators
 * Creates a blinking effect for live status
 */
export const createBlinkAnimation = () => {
  const opacity = new Animated.Value(1);

  const startBlink = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return { opacity, startBlink };
};

/**
 * Shake animation for error states
 * Used when there's an issue with tracking
 */
export const createShakeAnimation = () => {
  const shake = new Animated.Value(0);

  const startShake = () => {
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { shake, startShake };
};

/**
 * Scale pulse for attention-grabbing effect
 * More aggressive than regular pulse
 */
export const createAttentionPulse = () => {
  const scale = new Animated.Value(1);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return { scale, startPulse };
};
