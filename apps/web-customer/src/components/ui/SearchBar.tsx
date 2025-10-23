'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

export function SearchBar() {
  const [address, setAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Route to order page with query params
    router.push(`/order?address=${encodeURIComponent(address)}&time=${deliveryTime}`);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      onSubmit={handleSearch}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
        {/* Address Input */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary transition-all">
          <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Enter your delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none font-medium"
            required
          />
        </div>

        {/* Delivery Time Select */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary transition-all md:w-56">
          <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <select
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 focus:outline-none font-medium cursor-pointer"
          >
            <option value="asap">ASAP</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="schedule">Schedule Later</option>
          </select>
        </div>

        {/* Search Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-orange to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all md:w-auto"
        >
          <MagnifyingGlassIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Find Services</span>
          <span className="sm:hidden">Search</span>
        </motion.button>
      </div>

      {/* Popular Searches */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-center"
      >
        <p className="text-sm text-white/80 mb-2">Popular searches:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Dry Cleaning', 'Wash & Fold', 'Express Service', 'Wedding Dress Care'].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => router.push(`/services?q=${encodeURIComponent(term.toLowerCase())}`)}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm rounded-full transition-colors border border-white/20"
            >
              {term}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.form>
  );
}
