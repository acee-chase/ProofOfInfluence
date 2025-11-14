import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemedTableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
}

export function ThemedTable({ headers, rows, className }: ThemedTableProps) {
  const { theme } = useTheme();

  const headerStyles = theme === 'cyberpunk'
    ? 'text-xs font-semibold uppercase tracking-wide text-cyan-200/80 font-rajdhani'
    : 'text-xs font-semibold uppercase tracking-wide text-slate-500 font-poppins';

  const rowStyles = theme === 'cyberpunk'
    ? 'border-t border-cyan-400/20 hover:bg-cyan-400/5 transition-colors'
    : 'border-t border-slate-200 hover:bg-slate-50 transition-colors';

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className={cn('px-3 py-2', headerStyles)}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowStyles}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

