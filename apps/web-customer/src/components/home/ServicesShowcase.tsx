'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Container } from '../ui/Container';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const services = [
  {
    id: 'dry-cleaning',
    title: 'Dry Cleaning',
    description: 'Professional care for your suits, dresses, and delicate garments',
    price: 'From $8.99',
    icon: '👔',
    imageUrl: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=600&q=80&auto=format&fit=crop',
    gradient: 'from-brand-primary to-sky-600',
    glowColor: 'shadow-glow-gold',
    features: ['Expert pressing', 'Stain removal', 'Hanger delivery'],
  },
  {
    id: 'laundry',
    title: 'Wash & Fold',
    description: 'Fresh, clean laundry folded and ready to put away',
    price: 'From $2.50/lb',
    icon: '👕',
    imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80&auto=format&fit=crop',
    gradient: 'from-brand-orange to-orange-600',
    glowColor: 'shadow-glow-aqua',
    features: ['Sorted by preference', 'Premium detergent', 'Fabric softener'],
  },
  {
    id: 'alterations',
    title: 'Alterations',
    description: 'Expert tailoring for the perfect fit',
    price: 'From $12',
    icon: '✂️',
    imageUrl: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80&auto=format&fit=crop',
    gradient: 'from-brand-lavender to-purple-600',
    glowColor: 'shadow-glow-lavender',
    features: ['Hemming', 'Taking in/out', 'Zipper replacement'],
  },
  {
    id: 'special-care',
    title: 'Special Care',
    description: 'Delicate handling for wedding dresses, leather, and more',
    price: 'Custom Quote',
    icon: '⭐',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&auto=format&fit=crop',
    gradient: 'from-brand-green to-emerald-600',
    glowColor: 'shadow-glow-green',
    features: ['Wedding dresses', 'Leather & suede', 'Curtains & drapes'],
  },
];

export function ServicesShowcase() {
  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-brand-primary/5">
      <Container>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-navy mb-4">
            Our <span className="bg-gradient-to-r from-brand-orange to-brand-primary bg-clip-text text-transparent">Premium Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From everyday laundry to special occasion garments, we handle it all with expert care
          </p>
        </motion.div>

        {/* Services grid - larger, more vibrant cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -12 }}
              className="group"
            >
              <div className={`relative h-full bg-white rounded-3xl shadow-soft hover:${service.glowColor} transition-all duration-300 overflow-hidden`}>
                {/* Lifestyle Image Header */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-40`} />

                  {/* Icon overlay */}
                  <div className="absolute top-4 right-4">
                    <motion.div
                      whileHover={{ scale: 1.25, rotate: 15 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="text-5xl filter drop-shadow-lg"
                    >
                      {service.icon}
                    </motion.div>
                  </div>

                  {/* Twinkle effect for Special Care */}
                  {service.id === 'special-care' && (
                    <motion.div
                      className="absolute top-6 left-6 w-4 h-4"
                      animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="w-full h-full bg-white rounded-full shadow-lg" />
                    </motion.div>
                  )}
                </div>

                <div className="relative p-6 lg:p-8">

                  {/* Title & Description */}
                  <h3 className="text-2xl font-display font-bold text-brand-navy mb-3 group-hover:text-brand-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-5 min-h-[60px] leading-relaxed">
                    {service.description}
                  </p>

                  {/* Price badge with enhanced styling */}
                  <div className={`inline-block px-5 py-2.5 rounded-full bg-gradient-to-r ${service.gradient} text-white font-semibold text-sm mb-6 shadow-medium group-hover:shadow-large transition-shadow`}>
                    {service.price}
                  </div>

                  {/* Features with animated checkmarks */}
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + idx * 0.05 }}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="flex-shrink-0"
                        >
                          <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Enhanced CTA button */}
                  <Link
                    href={`/services/${service.id}`}
                    className="flex items-center justify-between w-full px-5 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 group/link border border-gray-100"
                  >
                    <span className="font-semibold text-brand-navy group-hover/link:text-brand-primary transition-colors">
                      Learn More
                    </span>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <ArrowRightIcon className="w-5 h-5 text-brand-primary" />
                    </motion.div>
                  </Link>
                </div>

                {/* Animated bottom accent bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${service.gradient} origin-left`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-brand-primary/5 to-brand-lavender/5 border border-brand-primary/10">
            <p className="text-lg text-gray-600 mb-4">
              Not sure which service you need?
            </p>
            <motion.a
              href="/help"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-lavender text-white font-semibold shadow-medium hover:shadow-large transition-shadow"
            >
              <span>Let us help you choose</span>
              <ArrowRightIcon className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
