import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'narrow' | 'wide';
}

/**
 * Global Container component for consistent centering and max-width
 * across all sections of the DryJets platform
 */
export function Container({ children, className = '', size = 'default' }: ContainerProps) {
  const sizeClasses = {
    narrow: 'max-w-4xl',       // 896px - for focused content
    default: 'max-w-[1280px]', // 1280px - standard sections (Uber Eats style)
    wide: 'max-w-[1400px]',    // 1400px - for expansive layouts
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
