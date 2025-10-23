'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Container } from '../ui/Container';
import { SparklesIcon, TruckIcon, ClockIcon } from '@heroicons/react/24/outline';

export function FinalCTA() {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden bg-gradient-to-br from-brand-navy via-slate-800 to-brand-navy">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-brand-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-brand-orange rounded-full blur-3xl"
        />

        {/* Subtle fabric texture overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      </div>

      <Container className="relative z-10">
        <div className="text-center">
          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-6xl font-display font-bold text-white mb-6">
              Ready to Reclaim Your{' '}
              <span className="bg-gradient-to-r from-brand-orange via-brand-primary to-brand-lavender bg-clip-text text-transparent">
                Weekends?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join <span className="font-semibold text-white">12,847+ satisfied customers</span> who've discovered the joy of never doing laundry again
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <Link href="/order">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-6 text-2xl font-bold rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 via-blue-500 to-purple-500 bg-[length:200%_auto]"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
                <span className="relative z-10 text-white flex items-center gap-3">
                  Schedule Your Pickup
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              {
                icon: ClockIcon,
                text: '60-second ordering',
                gradient: 'from-brand-primary to-blue-500',
              },
              {
                icon: TruckIcon,
                text: 'Free pickup & delivery',
                gradient: 'from-brand-orange to-orange-500',
              },
              {
                icon: SparklesIcon,
                text: '48-hour turnaround',
                gradient: 'from-brand-lavender to-purple-500',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-glow`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-white font-semibold text-lg">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-gray-400 text-sm"
          >
            No commitment required • Cancel anytime • 100% satisfaction guarantee
          </motion.p>
        </div>
      </Container>

      {/* Gradient wave effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange via-brand-primary to-brand-lavender" />
    </section>
  );
}
