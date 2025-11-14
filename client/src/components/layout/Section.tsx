import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  containerClassName?: string;
}

export function Section({ 
  children, 
  title, 
  subtitle, 
  className,
  containerClassName 
}: SectionProps) {
  const { theme } = useTheme();

  const titleStyles = theme === 'cyberpunk'
    ? 'text-2xl md:text-3xl font-bold font-orbitron tracking-tight text-cyan-100'
    : 'text-2xl md:text-3xl font-bold font-fredoka text-slate-900';

  const subtitleStyles = theme === 'cyberpunk'
    ? 'mt-2 text-sm md:text-base text-slate-300 font-rajdhani'
    : 'mt-2 text-sm md:text-base text-slate-600 font-poppins';

  return (
    <section className={cn('relative py-10 md:py-12', className)}>
      <div className={cn('mx-auto max-w-7xl px-4 md:px-8', containerClassName)}>
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h2 className={titleStyles}>{title}</h2>}
            {subtitle && <p className={subtitleStyles}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

