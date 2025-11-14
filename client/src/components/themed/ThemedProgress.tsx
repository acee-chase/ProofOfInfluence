import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedProgressProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function ThemedProgress({ 
  value, 
  className, 
  showLabel = false,
  animated = false 
}: ThemedProgressProps) {
  const { theme } = useTheme();
  
  const clampedValue = Math.max(0, Math.min(100, value));

  const containerStyles = theme === 'cyberpunk'
    ? 'h-2 w-full overflow-hidden rounded-[3px] bg-slate-800'
    : 'h-2 w-full overflow-hidden rounded-full bg-slate-100';

  const barStyles = theme === 'cyberpunk'
    ? 'h-full bg-gradient-to-r from-cyan-400 to-pink-500'
    : 'h-full bg-blue-600';

  const animationStyles = animated ? 'transition-all duration-500 ease-out' : '';

  return (
    <div className={cn('space-y-1', className)}>
      <div className={containerStyles}>
        <div 
          className={cn(barStyles, animationStyles)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <div className={cn(
          'text-xs text-right',
          theme === 'cyberpunk' ? 'text-cyan-300 font-rajdhani' : 'text-slate-600 font-poppins'
        )}>
          {clampedValue.toFixed(0)}%
        </div>
      )}
    </div>
  );
}

