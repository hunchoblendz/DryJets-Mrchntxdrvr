'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  TruckIcon,
  SparklesIcon,
  CreditCardIcon,
  ClockIcon,
  HeartIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Container } from '../ui/Container';

const badges = [
  {
    id: 'eco-friendly',
    title: 'Eco-Friendly',
    description: 'Green cleaning solutions',
    icon: GlobeAltIcon,
    gradient: 'from-brand-green to-emerald-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'licensed',
    title: 'Licensed & Insured',
    description: 'Fully certified professionals',
    icon: ShieldCheckIcon,
    gradient: 'from-brand-primary to-sky-600',
    bgColor: 'bg-sky-50',
  },
  {
    id: 'free-delivery',
    title: 'Free Pickup & Delivery',
    description: 'On orders over $35',
    icon: TruckIcon,
    gradient: 'from-brand-orange to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'quality',
    title: 'Quality Guarantee',
    description: '100% satisfaction or redo free',
    icon: SparklesIcon,
    gradient: 'from-brand-lavender to-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'secure-payment',
    title: 'Secure Payment',
    description: 'Encrypted transactions',
    icon: CreditCardIcon,
    gradient: 'from-brand-primary to-sky-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'fast-turnaround',
    title: '48-Hour Turnaround',
    description: 'Quick service guaranteed',
    icon: ClockIcon,
    gradient: 'from-brand-orange to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'customer-care',
    title: '24/7 Customer Care',
    description: 'Always here to help',
    icon: HeartIcon,
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'verified',
    title: 'Verified Reviews',
    description: '4.9/5 from real customers',
    icon: CheckBadgeIcon,
    gradient: 'from-brand-green to-emerald-600',
    bgColor: 'bg-emerald-50',
  },
];

export function TrustBadges() {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-lavender/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-fluid-4xl font-display font-bold text-brand-navy mb-4">
            Why Choose <span className="bg-gradient-to-r from-brand-primary to-brand-lavender bg-clip-text text-transparent">DryJets</span>?
          </h2>
          <p className="text-fluid-lg text-gray-600 max-w-2xl mx-auto">
            Your clothes are in safe hands with our premium service guarantees
          </p>
        </motion.div>

        {/* Badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {badges.map((badge, index) => {
            const BadgeIcon = badge.icon;
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  type: 'spring',
                  stiffness: 100
                }}
                className="group relative"
              >
                {/* Card with 3D effect */}
                <motion.div
                  whileHover={{ y: -12, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative h-full"
                >
                  {/* Main card */}
                  <div className={`${badge.bgColor} rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center relative overflow-hidden border-2 border-white shadow-soft hover:shadow-xl transition-all duration-500`}>
                    {/* Shimmer effect on hover */}
                    <motion.div
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    />

                    {/* 3D Icon container */}
                    <motion.div
                      whileHover={{
                        rotateY: 15,
                        rotateX: -10,
                        scale: 1.15
                      }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="relative mb-6"
                      style={{ perspective: '1000px' }}
                    >
                      {/* Icon background glow */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity scale-110`} />

                      {/* Icon container with 3D styling */}
                      <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center shadow-large transform-gpu rotate-0 group-hover:rotate-12 transition-transform duration-300`}>
                        {/* Top highlight for 3D effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-2xl" />

                        <motion.div
                          animate={{
                            y: [0, -4, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.2
                          }}
                        >
                          <BadgeIcon className="w-10 h-10 text-white relative z-10" strokeWidth={2} />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-lg font-display font-bold text-brand-navy mb-2 relative z-10">
                      {badge.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed relative z-10">
                      {badge.description}
                    </p>

                    {/* Bottom gradient accent */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 + 0.3, duration: 0.5 }}
                      className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${badge.gradient} origin-left rounded-b-3xl`}
                    />

                    {/* Decorative corner accent */}
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${badge.gradient} opacity-5 rounded-full blur-2xl`} />
                  </div>

                  {/* 3D shadow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${badge.gradient} opacity-0 group-hover:opacity-10 rounded-3xl blur-xl transition-opacity duration-500 -z-10 translate-y-2`} />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA with guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="inline-block"
          >
            <div className="relative group cursor-pointer">
              {/* Animated glow effect */}
              <motion.div
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 bg-gradient-to-r from-brand-green to-emerald-600 rounded-full blur-xl opacity-50"
              />

              {/* Main badge */}
              <div className="relative flex items-center gap-4 bg-gradient-to-r from-brand-green to-emerald-600 text-white px-10 py-6 rounded-full shadow-large border-2 border-white/20">
                {/* Icon with pulse animation */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                >
                  <ShieldCheckIcon className="w-7 h-7" />
                </motion.div>

                <div className="text-left">
                  <p className="font-display font-bold text-xl mb-1">Money-Back Guarantee</p>
                  <p className="text-sm text-green-100">Not satisfied? We'll make it right or refund 100%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
