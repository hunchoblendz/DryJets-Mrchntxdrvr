'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Container } from '../ui/Container';
import { SearchBar } from '../ui/SearchBar';
import { TruckIcon, BuildingStorefrontIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1920&q=80&auto=format&fit=crop"
          alt="Laundry delivery service"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50" />
      </div>

      <Container className="relative z-10 py-20">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight"
          >
            Laundry, pressed and delivered
            <br />
            <span className="bg-gradient-to-r from-brand-orange via-orange-400 to-brand-primary bg-clip-text text-transparent">
              right to your door
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Order from local laundromats. Track your pickup. Relax while we handle the rest.
          </motion.p>

          {/* Search Bar */}
          <SearchBar />

          {/* Quick Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {/* Customer Card */}
            <Link href="/order">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-brand-primary"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-primary to-blue-600 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">Order for Myself</h3>
                <p className="text-gray-600 text-sm">
                  Get laundry & dry cleaning delivered in 48 hours
                </p>
              </motion.div>
            </Link>

            {/* Merchant Card */}
            <Link href="/partners">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-brand-orange"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <BuildingStorefrontIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">List My Store</h3>
                <p className="text-gray-600 text-sm">
                  Grow your laundry business with online orders
                </p>
              </motion.div>
            </Link>

            {/* Driver Card */}
            <Link href="/drive">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-brand-lavender"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-lavender to-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">Drive & Earn</h3>
                <p className="text-gray-600 text-sm">
                  Earn $15-25/hour with flexible scheduling
                </p>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-orange" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.9/5 rating from 12,000+ customers</span>
            </div>
            <div className="h-4 w-px bg-white/30" />
            <span>🚚 Free pickup & delivery</span>
            <div className="h-4 w-px bg-white/30" />
            <span>⚡ 48-hour turnaround</span>
          </motion.div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/70 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
