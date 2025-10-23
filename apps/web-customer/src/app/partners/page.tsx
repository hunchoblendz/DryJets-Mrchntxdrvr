'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import {
  ChartBarIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function PartnersPage() {
  const benefits = [
    {
      icon: UsersIcon,
      title: 'Reach More Customers',
      description: 'Connect with thousands of local customers looking for laundry services',
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Easy-to-Use Platform',
      description: 'Simple app-based system for managing orders and tracking pickups',
    },
    {
      icon: CreditCardIcon,
      title: 'Get Paid Faster',
      description: 'Direct deposits within 2 business days of completed orders',
    },
    {
      icon: ChartBarIcon,
      title: 'Grow Your Revenue',
      description: 'Increase your monthly income with a steady stream of online orders',
    },
    {
      icon: ClockIcon,
      title: 'Flexible Operations',
      description: 'Set your own hours and capacity based on your business needs',
    },
    {
      icon: CheckCircleIcon,
      title: 'Full Support',
      description: '24/7 merchant support team ready to help you succeed',
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-navy">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1920&q=80&auto=format&fit=crop"
            alt="Laundromat business owner"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>

        <Container className="relative z-10 py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6"
          >
            Grow Your Laundry
            <br />
            <span className="bg-gradient-to-r from-brand-orange to-orange-400 bg-clip-text text-transparent">
              Business with DryJets
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
          >
            Join hundreds of local cleaners earning more with online orders, automated pickup coordination, and digital payments
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/partners/apply"
              className="px-10 py-5 bg-gradient-to-r from-brand-orange to-orange-600 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Apply Now
            </Link>
            <Link
              href="/partners/demo"
              className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white text-white text-lg font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              Schedule Demo
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: '500+', label: 'Partner Stores' },
              { value: '$2.5M+', label: 'Paid to Partners' },
              { value: '4.8★', label: 'Merchant Rating' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-display font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-300">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-navy mb-4">
              Why Partner With <span className="text-brand-orange">DryJets</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to scale your laundry business in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 bg-gray-50 rounded-2xl hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-brand-orange to-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <Container size="narrow">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-navy mb-4">
              Simple, <span className="text-brand-orange">Transparent Pricing</span>
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your business</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Commission Plan */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-brand-navy mb-2">Commission-Based</h3>
                <p className="text-gray-600">Pay only for what you earn</p>
                <div className="mt-6">
                  <span className="text-5xl font-display font-bold text-brand-navy">15%</span>
                  <span className="text-xl text-gray-600"> per order</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {['No monthly fees', 'Unlimited orders', 'Standard features', 'Email support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-brand-orange flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/partners/apply"
                className="block w-full py-4 text-center bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Subscription Plan */}
            <div className="bg-gradient-to-br from-brand-orange to-orange-600 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-white/10 rounded-full w-64 h-64 -mr-32 -mt-32" />
              <div className="relative">
                <div className="text-center mb-8">
                  <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-bold mb-4">
                    MOST POPULAR
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Unlimited</h3>
                  <p className="text-orange-100">Process as many orders as you want</p>
                  <div className="mt-6">
                    <span className="text-5xl font-display font-bold">$199</span>
                    <span className="text-xl text-orange-100"> /month</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {['Zero commission', 'Unlimited orders', 'Priority support', 'Advanced analytics', 'Featured listing'].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-white flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/partners/apply"
                  className="block w-full py-4 text-center bg-white text-brand-orange font-bold rounded-xl hover:scale-105 transition-transform"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-brand-navy text-white">
        <Container className="text-center">
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join DryJets today and start receiving orders from local customers
          </p>
          <Link
            href="/partners/apply"
            className="inline-block px-12 py-5 bg-gradient-to-r from-brand-orange to-orange-600 text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Apply Now →
          </Link>
        </Container>
      </section>
    </main>
  );
}
