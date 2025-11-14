import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function ThemedInput({ 
  label, 
  error, 
  helperText,
  className,
  ...props 
}: ThemedInputProps) {
  const { theme } = useTheme();

  const inputStyles = theme === 'cyberpunk'
    ? 'rounded-[6px] border border-cyan-400/30 bg-slate-950/60 text-slate-100 placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/20'
    : 'rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

  const errorStyles = error
    ? theme === 'cyberpunk'
      ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
      : 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : '';

  const labelStyles = theme === 'cyberpunk'
    ? 'text-xs text-slate-400 mb-1 block font-rajdhani'
    : 'text-sm text-slate-700 mb-1 block font-poppins';

  const helperTextStyles = theme === 'cyberpunk'
    ? 'text-xs text-slate-500 mt-1 font-rajdhani'
    : 'text-xs text-slate-600 mt-1 font-poppins';

  const errorTextStyles = theme === 'cyberpunk'
    ? 'text-xs text-red-400 mt-1 font-rajdhani'
    : 'text-xs text-red-500 mt-1 font-poppins';

  return (
    <div className="w-full">
      {label && <label className={labelStyles}>{label}</label>}
      <input
        className={cn(
          'w-full px-3 py-2 text-sm outline-none transition-all duration-200',
          inputStyles,
          errorStyles,
          className
        )}
        {...props}
      />
      {error && <div className={errorTextStyles}>{error}</div>}
      {!error && helperText && <div className={helperTextStyles}>{helperText}</div>}
    </div>
  );
}

