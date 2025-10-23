'use client';

import { motion } from 'framer-motion';
import { DevicePhoneMobileIcon, TruckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Container } from '../ui/Container';

const steps = [
  {
    number: '01',
    title: 'Order Online',
    description: 'Place your order in just 60 seconds. Choose your services and schedule pickup.',
    icon: DevicePhoneMobileIcon,
    color: 'from-brand-primary to-sky-600',
    glowColor: 'shadow-glow-aqua',
  },
  {
    number: '02',
    title: 'We Pickup',
    description: 'Our friendly driver arrives at your door same or next day. No need to be home!',
    icon: TruckIcon,
    color: 'from-brand-orange to-orange-600',
    glowColor: 'shadow-glow-orange',
  },
  {
    number: '03',
    title: 'Enjoy Fresh Clothes',
    description: 'Get your clothes back cleaned, pressed, and ready to wear in 48 hours.',
    icon: SparklesIcon,
    color: 'from-brand-green to-emerald-600',
    glowColor: 'shadow-glow-green',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-24 bg-white relative overflow-hidden">
      {/* Enhanced background decoration with gradient strip */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-5" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-lavender rounded-full blur-3xl opacity-5" />

        {/* Soft gradient background strip */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent" />
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
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-navy mb-4">
            Three Steps to <span className="bg-gradient-to-r from-brand-primary to-brand-lavender bg-clip-text text-transparent">Cleaner Clothes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We've made getting your laundry done as easy as ordering pizza. Zero hassle, maximum convenience.
          </p>
        </motion.div>

        {/* Steps with enhanced connector lines */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Enhanced connection line with animated gradient (desktop only) */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 + 0.4 }}
                  className="hidden md:block absolute top-16 left-1/2 w-full h-1 origin-left z-0"
                >
                  <div className={`h-full bg-gradient-to-r ${step.color} opacity-20 rounded-full`} />
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-full`}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />
                </motion.div>
              )}

              <div className="relative z-10 text-center">
                {/* Enhanced icon container with glow on hover */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative inline-block mb-6"
                >
                  <motion.div
                    className={`inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br ${step.color} shadow-large hover:${step.glowColor} transition-all duration-300`}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <step.icon className="w-16 h-16 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Number badge with enhanced styling */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', delay: index * 0.2 + 0.6 }}
                    className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-white shadow-large flex items-center justify-center border-2 border-gray-100"
                  >
                    <span className={`text-xl font-display font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                      {step.number}
                    </span>
                  </motion.div>
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-display font-bold text-brand-navy mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to reclaim your weekends?
          </p>
          <motion.a
            href="/order"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-600 text-white font-semibold text-lg shadow-medium hover:shadow-glow-orange transition-shadow"
          >
            <span>Get Started Now</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.a>
        </motion.div>
      </Container>
    </section>
  );
}
