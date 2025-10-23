'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { CheckIcon, SparklesIcon, RocketLaunchIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { AnimatedButton } from '../ui/AnimatedButton';
import { Container } from '../ui/Container';

const pricingTiers = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Perfect for individuals',
    monthlyPrice: '29',
    annualPrice: '23',
    period: 'per month',
    description: 'Essential laundry and dry cleaning services',
    icon: SparklesIcon,
    gradient: 'from-brand-primary to-sky-600',
    popular: false,
    features: [
      { name: 'Up to 20 lbs laundry/month', included: true },
      { name: 'Standard dry cleaning (5 items)', included: true },
      { name: 'Free pickup & delivery', included: true },
      { name: '48-hour turnaround', included: true },
      { name: 'Basic stain removal', included: true },
      { name: 'Priority scheduling', included: false },
      { name: 'Dedicated account manager', included: false },
      { name: 'Same-day service', included: false },
    ],
    cta: 'Get Started',
    ctaVariant: 'outline' as const,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Most popular choice',
    monthlyPrice: '79',
    annualPrice: '63',
    period: 'per month',
    description: 'Comprehensive care for busy professionals',
    icon: RocketLaunchIcon,
    gradient: 'from-brand-orange to-orange-600',
    popular: true,
    features: [
      { name: 'Up to 50 lbs laundry/month', included: true },
      { name: 'Unlimited dry cleaning', included: true },
      { name: 'Free pickup & delivery', included: true },
      { name: '24-hour turnaround', included: true },
      { name: 'Advanced stain removal', included: true },
      { name: 'Priority scheduling', included: true },
      { name: 'Garment repairs included', included: true },
      { name: 'Same-day service available', included: false },
    ],
    cta: 'Start Premium',
    ctaVariant: 'primary' as const,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For families & businesses',
    monthlyPrice: '149',
    annualPrice: '119',
    period: 'per month',
    description: 'White-glove service with unlimited care',
    icon: BuildingOfficeIcon,
    gradient: 'from-brand-lavender to-purple-600',
    popular: false,
    features: [
      { name: 'Unlimited laundry', included: true },
      { name: 'Unlimited dry cleaning', included: true },
      { name: 'Free pickup & delivery', included: true },
      { name: 'Same-day turnaround', included: true },
      { name: 'Premium stain removal', included: true },
      { name: 'Priority scheduling', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Complimentary alterations', included: true },
    ],
    cta: 'Contact Sales',
    ctaVariant: 'secondary' as const,
  },
];

export function PricingPreview() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-brand-lavender/5 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-fluid-4xl font-display font-bold text-brand-navy mb-4">
            Simple, <span className="bg-gradient-to-r from-brand-orange to-brand-primary bg-clip-text text-transparent">Transparent Pricing</span>
          </h2>
          <p className="text-fluid-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your lifestyle. No hidden fees, cancel anytime.
          </p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <span className={`text-base font-semibold transition-colors ${!isAnnual ? 'text-brand-navy' : 'text-gray-500'}`}>
              Monthly
            </span>

            {/* Toggle switch */}
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-16 h-8 rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
              style={{
                backgroundColor: isAnnual ? 'rgb(59 130 246)' : 'rgb(229 231 235)'
              }}
            >
              <motion.div
                animate={{ x: isAnnual ? 32 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </button>

            <span className={`text-base font-semibold transition-colors ${isAnnual ? 'text-brand-navy' : 'text-gray-500'}`}>
              Annual
            </span>
          </motion.div>

          {/* Savings badge */}
          <AnimatePresence mode="wait">
            {isAnnual && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-green to-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-soft"
              >
                <SparklesIcon className="w-4 h-4" />
                Save 20% with annual billing
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: tier.popular ? 0 : -8 }}
              className={`relative rounded-3xl overflow-hidden ${
                tier.popular
                  ? 'bg-gradient-to-br from-brand-navy to-slate-800 text-white scale-105 shadow-large'
                  : 'bg-white shadow-medium hover:shadow-large'
              } transition-all duration-300`}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-brand-orange to-orange-600 text-white text-center py-2 text-sm font-bold">
                  MOST POPULAR
                </div>
              )}

              <div className={`p-8 ${tier.popular ? 'pt-16' : ''}`}>
                {/* Icon */}
                <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.gradient} items-center justify-center mb-6 shadow-medium`}>
                  <tier.icon className="w-8 h-8 text-white" />
                </div>

                {/* Tier info */}
                <h3 className={`text-2xl font-display font-bold mb-2 ${tier.popular ? 'text-white' : 'text-brand-navy'}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm mb-6 ${tier.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                  {tier.tagline}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isAnnual ? 'annual' : 'monthly'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`text-5xl font-display font-bold ${tier.popular ? 'text-white' : 'text-brand-navy'}`}
                      >
                        ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                      </motion.span>
                    </AnimatePresence>
                    <span className={`text-lg ${tier.popular ? 'text-gray-400' : 'text-gray-600'}`}>
                      /{tier.period.split(' ')[1]}
                    </span>
                  </div>
                  {isAnnual && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs mt-1 ${tier.popular ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      Billed annually (${parseInt(tier.annualPrice) * 12}/year)
                    </motion.p>
                  )}
                  <p className={`text-sm mt-2 ${tier.popular ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tier.description}
                  </p>
                </div>

                {/* CTA button */}
                <Link href="/order" className="block mb-8">
                  <AnimatedButton
                    variant={tier.ctaVariant}
                    size="lg"
                    fullWidth
                    className={tier.popular ? '!bg-gradient-to-r !from-brand-orange !to-orange-600' : ''}
                  >
                    {tier.cta}
                  </AnimatedButton>
                </Link>

                {/* Features list */}
                <div className="space-y-4">
                  <p className={`text-sm font-semibold uppercase tracking-wide ${tier.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-3 text-sm ${
                          feature.included
                            ? tier.popular
                              ? 'text-gray-200'
                              : 'text-gray-700'
                            : tier.popular
                            ? 'text-gray-500'
                            : 'text-gray-400'
                        }`}
                      >
                        <CheckIcon
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            feature.included
                              ? 'text-brand-green'
                              : tier.popular
                              ? 'text-gray-600'
                              : 'text-gray-300'
                          }`}
                        />
                        <span className={feature.included ? '' : 'line-through'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom accent */}
              {!tier.popular && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`h-1 bg-gradient-to-r ${tier.gradient} origin-left`}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Pay-as-you-go option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h3 className="text-2xl lg:text-3xl font-display font-bold text-brand-navy mb-4">
              Prefer Pay-As-You-Go?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              No commitment needed. Order individual services anytime at competitive rates.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-brand-primary mb-1">$2.50/lb</p>
                <p className="text-sm text-gray-600">Wash & Fold</p>
              </div>
              <div className="w-px bg-gray-300" />
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-brand-orange mb-1">$8.99+</p>
                <p className="text-sm text-gray-600">Dry Cleaning</p>
              </div>
              <div className="w-px bg-gray-300" />
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-brand-lavender mb-1">$12+</p>
                <p className="text-sm text-gray-600">Alterations</p>
              </div>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-navy font-semibold transition-colors group"
            >
              <span>View all services & pricing</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Have questions about our pricing?
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-navy font-semibold transition-colors"
          >
            <span>Check our FAQ</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
