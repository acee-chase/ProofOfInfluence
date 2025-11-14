import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function ThemedCard({ children, className, hover = false }: ThemedCardProps) {
  const { theme } = useTheme();

  const baseStyles = theme === 'cyberpunk'
    ? 'rounded-md border border-cyan-400/25 bg-slate-950/40 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
    : 'rounded-2xl border border-slate-200 bg-white shadow-xl';

  const hoverStyles = hover
    ? theme === 'cyberpunk'
      ? 'hover:border-cyan-400/40 hover:shadow-[0_0_32px_rgba(34,211,238,0.18)] transition-all duration-300'
      : 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-300'
    : '';

  return (
    <div className={cn(baseStyles, hoverStyles, className)}>
      {children}
    </div>
  );
}

