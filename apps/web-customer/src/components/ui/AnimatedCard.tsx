'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  delay?: number;
}

export function AnimatedCard({ children, className = '', hoverEffect = true, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverEffect ? { y: -8, transition: { duration: 0.2 } } : {}}
      className={`bg-white rounded-3xl shadow-soft hover:shadow-large transition-shadow duration-300 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}
