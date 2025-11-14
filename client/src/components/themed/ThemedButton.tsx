import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  emphasis?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemedButton({ 
  children, 
  emphasis = false, 
  variant = 'default',
  size = 'md',
  className,
  ...props 
}: ThemedButtonProps) {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }[size];

  const getVariantStyles = () => {
    if (theme === 'cyberpunk') {
      if (emphasis) {
        return 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/50 hover:bg-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] rounded-md';
      }
      if (variant === 'outline') {
        return 'border border-slate-700/70 text-slate-200 hover:border-cyan-400/40 hover:text-cyan-300 rounded-md';
      }
      if (variant === 'ghost') {
        return 'text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-200 rounded-md';
      }
      return 'bg-slate-800/60 text-slate-200 border border-slate-700/50 hover:border-cyan-400/30 rounded-md';
    } else {
      // playful theme
      if (emphasis) {
        return 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 rounded-full shadow-lg';
      }
      if (variant === 'outline') {
        return 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 active:scale-95 rounded-full';
      }
      if (variant === 'ghost') {
        return 'text-slate-700 hover:bg-slate-100 active:scale-95 rounded-full';
      }
      return 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-95 rounded-full';
    }
  };

  return (
    <button
      className={cn(
        'font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeStyles,
        getVariantStyles(),
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

