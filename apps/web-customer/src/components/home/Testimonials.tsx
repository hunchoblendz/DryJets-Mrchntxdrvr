'use client';

import { motion, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Container } from '../ui/Container';

// Count-up animation hook
function useCountUp(end: number, duration: number = 2000, shouldStart: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
}

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Marketing Director',
    avatar: 'SM',
    rating: 5,
    text: "DryJets has been a lifesaver! As a busy professional, I don't have time for laundry day. Their pickup and delivery service is seamless, and my clothes always come back looking brand new.",
    gradient: 'from-brand-primary to-sky-600',
  },
  {
    id: 2,
    name: 'James Chen',
    role: 'Entrepreneur',
    avatar: 'JC',
    rating: 5,
    text: "I've tried several dry cleaning services, but DryJets stands out. The attention to detail is incredible, and their app makes scheduling so easy. My suits have never looked better!",
    gradient: 'from-brand-orange to-orange-600',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Real Estate Agent',
    avatar: 'ER',
    rating: 5,
    text: "The convenience is unmatched. I can schedule pickups around my showings, and they've never missed a deadline. Plus, their eco-friendly approach aligns with my values.",
    gradient: 'from-brand-lavender to-purple-600',
  },
  {
    id: 4,
    name: 'Michael Thompson',
    role: 'Doctor',
    avatar: 'MT',
    rating: 5,
    text: "Working long hours at the hospital, I barely have time to breathe. DryJets picks up my scrubs and clothes right from my doorstep. It's one less thing to worry about!",
    gradient: 'from-brand-green to-emerald-600',
  },
  {
    id: 5,
    name: 'Lisa Park',
    role: 'Interior Designer',
    avatar: 'LP',
    rating: 5,
    text: "Their special care service for delicate fabrics is outstanding. I trust them with my designer pieces and client samples. The quality is consistently excellent!",
    gradient: 'from-brand-primary to-sky-600',
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });

  // Count-up values
  const customersCount = useCountUp(12847, 2000, isStatsInView);
  const satisfactionCount = useCountUp(98, 1500, isStatsInView);
  const ordersCount = useCountUp(45000, 2500, isStatsInView);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
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
            What Our <span className="bg-gradient-to-r from-brand-orange to-brand-primary bg-clip-text text-transparent">Customers Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who've reclaimed their time
          </p>
        </motion.div>

        {/* Main testimonial card */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <div className="relative h-[400px] lg:h-[350px] overflow-hidden">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              <div className="bg-white rounded-3xl shadow-large p-8 lg:p-12 relative overflow-hidden border border-gray-100">
                {/* Background gradient decoration */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${currentTestimonial.gradient} rounded-full opacity-5`} />

                {/* Quote icon */}
                <div className="absolute top-8 right-8 text-8xl text-gray-100 font-serif leading-none">
                  "
                </div>

                <div className="relative">
                  {/* Rating stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <StarIcon className="w-6 h-6 text-brand-orange" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed font-light">
                    {currentTestimonial.text}
                  </p>

                  {/* Customer info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentTestimonial.gradient} flex items-center justify-center text-white font-display font-bold text-xl shadow-medium`}>
                      {currentTestimonial.avatar}
                    </div>

                    <div>
                      <h4 className="text-lg font-display font-bold text-brand-navy">
                        {currentTestimonial.name}
                      </h4>
                      <p className="text-gray-600">
                        {currentTestimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 w-12 h-12 rounded-full bg-white shadow-medium hover:shadow-large transition-shadow flex items-center justify-center text-brand-navy hover:text-brand-primary group"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 w-12 h-12 rounded-full bg-white shadow-medium hover:shadow-large transition-shadow flex items-center justify-center text-brand-navy hover:text-brand-primary group"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-3 mb-16">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-12 h-3 bg-gradient-to-r from-brand-orange to-brand-primary shadow-glow-orange'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats row with count-up animation */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center p-6 lg:p-8 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-shadow border border-gray-100"
          >
            <p className="text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-brand-primary to-brand-lavender bg-clip-text text-transparent mb-2">
              {customersCount.toLocaleString()}
            </p>
            <p className="text-gray-600 font-medium">
              Happy Customers
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center p-6 lg:p-8 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-shadow border border-gray-100"
          >
            <p className="text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-brand-orange to-orange-600 bg-clip-text text-transparent mb-2">
              {satisfactionCount}%
            </p>
            <p className="text-gray-600 font-medium">
              Satisfaction Rate
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center p-6 lg:p-8 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-shadow border border-gray-100"
          >
            <p className="text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent mb-2">
              {ordersCount.toLocaleString()}+
            </p>
            <p className="text-gray-600 font-medium">
              Orders Completed
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center p-6 lg:p-8 rounded-2xl bg-white shadow-soft hover:shadow-medium transition-shadow border border-gray-100"
          >
            <p className="text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-brand-lavender to-purple-600 bg-clip-text text-transparent mb-2">
              4.9/5
            </p>
            <p className="text-gray-600 font-medium">
              Average Rating
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
