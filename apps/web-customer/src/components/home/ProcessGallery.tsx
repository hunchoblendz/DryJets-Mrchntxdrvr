'use client';

import { motion, useInView } from 'framer-motion';
import { useState, useRef } from 'react';
import {
  CheckCircleIcon,
  SparklesIcon,
  TruckIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import { Container } from '../ui/Container';

const processSteps = [
  {
    id: 'facility',
    title: 'State-of-the-Art Facility',
    description: 'Our modern cleaning facility features eco-friendly equipment and climate-controlled storage',
    icon: BuildingStorefrontIcon,
    gradient: 'from-brand-primary to-sky-600',
    imageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Modern dry cleaning facility',
    stats: ['5,000 sq ft', 'HEPA filtered', 'Climate controlled'],
  },
  {
    id: 'team',
    title: 'Expert Care Team',
    description: 'Our professionally trained staff has decades of combined experience in garment care',
    icon: UserGroupIcon,
    gradient: 'from-brand-orange to-orange-600',
    imageUrl: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Professional cleaning team',
    stats: ['15+ years experience', 'Certified experts', 'Background checked'],
  },
  {
    id: 'inspection',
    title: 'Quality Inspection',
    description: 'Every garment undergoes thorough inspection before and after cleaning',
    icon: CheckCircleIcon,
    gradient: 'from-brand-green to-emerald-600',
    imageUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Quality inspection process',
    stats: ['3-point check', '100% inspection', 'Satisfaction guaranteed'],
  },
  {
    id: 'cleaning',
    title: 'Premium Cleaning',
    description: 'We use gentle, eco-friendly solutions that are tough on stains but safe for fabrics',
    icon: SparklesIcon,
    gradient: 'from-brand-lavender to-purple-600',
    imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Premium cleaning process',
    stats: ['Eco-friendly', 'Gentle formulas', 'Stain removal'],
  },
  {
    id: 'packaging',
    title: 'Careful Packaging',
    description: 'Your clothes are carefully folded or hung, wrapped, and ready for delivery',
    icon: ShieldCheckIcon,
    gradient: 'from-brand-primary to-sky-600',
    imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Professional packaging',
    stats: ['Protective wrapping', 'Hanger delivery', 'Organized by type'],
  },
  {
    id: 'delivery',
    title: 'On-Time Delivery',
    description: 'Our reliable drivers ensure your clothes arrive fresh and on schedule',
    icon: TruckIcon,
    gradient: 'from-brand-orange to-orange-600',
    imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80&auto=format&fit=crop',
    imageAlt: 'Delivery service',
    stats: ['GPS tracked', 'Text updates', 'Contactless option'],
  },
];

export function ProcessGallery() {
  const [selectedStep, setSelectedStep] = useState(0);
  const currentStep = processSteps[selectedStep];
  const CurrentIcon = currentStep.icon;
  const timelineRef = useRef(null);
  const isTimelineInView = useInView(timelineRef, { once: true, amount: 0.2 });

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />
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
            Behind the <span className="bg-gradient-to-r from-brand-orange to-brand-primary bg-clip-text text-transparent">Scenes</span>
          </h2>
          <p className="text-fluid-lg text-gray-600 max-w-2xl mx-auto">
            Transparency you can trust. See how we care for your clothes from start to finish
          </p>
        </motion.div>

        {/* Timeline storytelling */}
        <div ref={timelineRef} className="relative max-w-5xl mx-auto mb-20">
          {/* Vertical timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary via-brand-orange to-brand-lavender opacity-20" />
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isTimelineInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-primary via-brand-orange to-brand-lavender origin-top"
          />

          {/* Timeline steps */}
          <div className="space-y-12">
            {processSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                >
                  {/* Timeline node */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
                    className={`absolute left-8 md:left-1/2 w-16 h-16 -ml-8 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-large z-10 rotate-45`}
                  >
                    <StepIcon className="w-8 h-8 text-white -rotate-45" />
                  </motion.div>

                  {/* Content card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${isEven ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'}`}
                  >
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-large border border-white/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Image header */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={step.imageUrl}
                          alt={step.imageAlt}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${step.gradient} opacity-20`} />

                        {/* Step badge overlay */}
                        <div className="absolute top-4 left-4">
                          <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${step.gradient} text-white text-sm font-bold shadow-soft`}>
                            Step {index + 1}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8">
                        <h3 className="text-2xl font-display font-bold text-brand-navy mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-6">
                          {step.description}
                        </p>

                        {/* Stats badges */}
                        <div className="flex flex-wrap gap-2">
                          {step.stats.map((stat, statIndex) => (
                            <motion.span
                              key={statIndex}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.1 + statIndex * 0.1 + 0.4 }}
                              whileHover={{ scale: 1.1 }}
                              className={`px-4 py-2 bg-gradient-to-r ${step.gradient} bg-opacity-10 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:border-gray-300 transition-colors`}
                            >
                              {stat}
                            </motion.span>
                          ))}
                        </div>
                      </div>

                      {/* Decorative gradient corner */}
                      <div className={`absolute top-0 ${isEven ? 'md:right-0' : 'md:left-0'} w-20 h-20 bg-gradient-to-br ${step.gradient} opacity-5 rounded-3xl blur-2xl`} />
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom assurance banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-brand-navy to-slate-800 rounded-3xl p-10 lg:p-14 text-white text-center relative overflow-hidden"
        >
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -50, 0],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 right-0 w-96 h-96 bg-brand-primary rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 150 }}
              className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center shadow-glow-orange rotate-45"
            >
              <ShieldCheckIcon className="w-12 h-12 -rotate-45" />
            </motion.div>

            <h3 className="text-fluid-3xl font-display font-bold mb-4">
              Your Satisfaction is Our Promise
            </h3>
            <p className="text-fluid-lg text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              We handle every garment with the same care we'd give our own. If you're not 100% satisfied, we'll make it right—no questions asked.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { value: '100%', label: 'Satisfaction Rate', color: 'from-brand-orange to-orange-400' },
                { value: 'Zero', label: 'Risk Guarantee', color: 'from-brand-primary to-blue-400' },
                { value: '24/7', label: 'Support Available', color: 'from-brand-green to-emerald-400' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all"
                >
                  <p className={`text-5xl font-display font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </p>
                  <p className="text-base text-gray-200 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
