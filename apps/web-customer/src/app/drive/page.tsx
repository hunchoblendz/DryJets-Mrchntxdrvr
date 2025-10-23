'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import {
  ClockIcon,
  CurrencyDollarIcon,
  MapIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function DrivePage() {
  const benefits = [
    {
      icon: ClockIcon,
      title: 'Flexible Schedule',
      description: 'Work when you want, as much as you want. You're in control of your hours.',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Earn $15-25/hour',
      description: 'Competitive pay plus tips. Top earners make over $30/hour during peak times.',
    },
    {
      icon: MapIcon,
      title: 'Simple Routes',
      description: 'GPS-optimized routes make pickups and deliveries quick and efficient.',
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Easy-to-Use App',
      description: 'Accept orders, navigate routes, and track earnings all in one simple app.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Insurance Covered',
      description: 'You're protected with liability insurance while on active deliveries.',
    },
    {
      icon: CalendarIcon,
      title: 'Weekly Payouts',
      description: 'Get paid every week with direct deposit. Fast and reliable.',
    },
  ];

  const requirements = [
    'Valid driver's license',
    'Clean driving record',
    'Reliable vehicle (car, van, or SUV)',
    'Smartphone (iOS or Android)',
    'Background check clearance',
    'Age 21+',
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1920&q=80&auto=format&fit=crop"
            alt="Delivery driver"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-lavender/90 via-brand-lavender/80 to-purple-600/80" />
        </div>

        <Container className="relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6"
            >
              Drive. Earn. Repeat.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl mb-8"
            >
              Make money on your schedule delivering laundry
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link
                href="/drive/apply"
                className="px-10 py-5 bg-white text-brand-lavender text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Start Earning →
              </Link>
              <Link
                href="/drive/requirements"
                className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white text-white text-lg font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 text-white/90"
            >
              <div>
                <p className="text-4xl font-bold">$15-25</p>
                <p className="text-sm">Per Hour</p>
              </div>
              <div className="w-px bg-white/30" />
              <div>
                <p className="text-4xl font-bold">2,000+</p>
                <p className="text-sm">Active Drivers</p>
              </div>
              <div className="w-px bg-white/30" />
              <div>
                <p className="text-4xl font-bold">Weekly</p>
                <p className="text-sm">Payouts</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-navy mb-4">
              Why Drive With <span className="text-brand-lavender">DryJets</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of drivers earning on their own terms
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
                className="p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl hover:shadow-xl transition-all border border-purple-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-brand-lavender to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <Container size="narrow">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-navy mb-4">
              Get Started in <span className="text-brand-lavender">3 Easy Steps</span>
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Sign Up',
                description: 'Complete our quick online application and background check. Takes less than 10 minutes.',
              },
              {
                step: '2',
                title: 'Get Approved',
                description: 'We'll review your application within 48 hours and send you the driver app.',
              },
              {
                step: '3',
                title: 'Start Earning',
                description: 'Accept your first delivery and start making money on your schedule.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-6 items-start bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-brand-lavender to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-lg">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Requirements */}
      <section className="py-20 md:py-24 bg-white">
        <Container size="narrow">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-navy mb-4">
              Driver Requirements
            </h2>
            <p className="text-xl text-gray-600">Make sure you meet these basic requirements</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-10 rounded-3xl border-2 border-purple-100">
            <div className="grid md:grid-cols-2 gap-6">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-lavender to-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-brand-lavender via-purple-600 to-brand-lavender text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

        <Container className="relative z-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Ready to Hit the Road?
          </h2>
          <p className="text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Start earning today with flexible hours and competitive pay
          </p>
          <Link
            href="/drive/apply"
            className="inline-block px-12 py-5 bg-white text-brand-lavender text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Apply to Drive →
          </Link>
        </Container>
      </section>
    </main>
  );
}
