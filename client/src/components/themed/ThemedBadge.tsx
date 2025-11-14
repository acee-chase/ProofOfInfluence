import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}

export function ThemedBadge({ 
  children, 
  variant = 'default', 
  className,
  onClick 
}: ThemedBadgeProps) {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    if (theme === 'cyberpunk') {
      const variants = {
        default: 'border-cyan-400/30 text-cyan-200',
        success: 'border-green-400/30 text-green-200',
        warning: 'border-yellow-400/30 text-yellow-200',
        danger: 'border-red-400/30 text-red-200',
      };
      return `rounded-[6px] border ${variants[variant]}`;
    } else {
      const variants = {
        default: 'border-slate-200 text-slate-700 bg-white',
        success: 'border-green-200 text-green-700 bg-green-50',
        warning: 'border-yellow-200 text-yellow-700 bg-yellow-50',
        danger: 'border-red-200 text-red-700 bg-red-50',
      };
      return `rounded-full border ${variants[variant]}`;
    }
  };

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-medium transition-colors',
        getVariantStyles(),
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      {children}
    </Component>
  );
}

