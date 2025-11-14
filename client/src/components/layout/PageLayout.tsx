import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function PageLayout({ 
  children, 
  className,
  showHeader = true,
  showFooter = true
}: PageLayoutProps) {
  const { theme } = useTheme();

  const backgroundStyles = theme === 'cyberpunk'
    ? 'bg-[#0a0a0f] text-slate-100'
    : 'bg-white text-slate-900';

  return (
    <div className={cn('min-h-screen', backgroundStyles)}>
      {/* Background effects */}
      {theme === 'cyberpunk' && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Grid background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(148,163,184,0.10) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148,163,184,0.10) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
          {/* Scan line animation */}
          <div 
            className="absolute inset-0 animate-scan-line pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(56,189,248,0.05) 50%, transparent 100%)'
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {showHeader && <Header />}
        <main className={cn('', className)}>
          {children}
        </main>
        {showFooter && <Footer />}
      </div>
    </div>
  );
}

