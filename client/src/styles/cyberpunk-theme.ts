/**
 * ACEE Cyberpunk 2077 + Financial Cold Theme
 * 
 * Design Principles:
 * - Dark, professional, and futuristic
 * - Neon accents (cyan, purple, pink)
 * - Grid lines and scan line effects
 * - Sharp corners and edges
 * - Matrix-style background animations
 * - Financial data visualization focus
 */

export const cyberpunkTheme = {
  // Color Palette
  colors: {
    // Base backgrounds
    background: {
      primary: '#0a0a0f',      // Deep black-blue
      secondary: '#0f1015',    // Slightly lighter
      tertiary: '#1a1a24',     // Card backgrounds
      elevated: '#20202e',     // Elevated elements
    },
    
    // Neon accents
    neon: {
      cyan: '#00f0ff',         // Primary neon
      purple: '#b620e0',       // Secondary neon
      pink: '#ff006e',         // Accent neon
      green: '#00ff88',        // Success neon
      yellow: '#ffea00',       // Warning neon
      red: '#ff0055',          // Error/danger neon
    },
    
    // Grid and borders
    grid: {
      primary: 'rgba(0, 240, 255, 0.1)',    // Cyan grid
      secondary: 'rgba(182, 32, 224, 0.08)', // Purple grid
      glow: 'rgba(0, 240, 255, 0.3)',       // Grid glow
    },
    
    // Text
    text: {
      primary: '#e8e8ff',      // Main text
      secondary: '#9090b8',    // Secondary text
      muted: '#60607a',        // Muted text
      neon: '#00f0ff',         // Neon text
    },
    
    // Glass morphism
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.08)',
      heavy: 'rgba(255, 255, 255, 0.12)',
    },
  },
  
  // Typography
  fonts: {
    display: '"Orbitron", "Rajdhani", sans-serif',  // Headers
    body: '"Inter", "system-ui", sans-serif',        // Body text
    mono: '"JetBrains Mono", "Courier New", monospace', // Code/data
  },
  
  // Effects
  effects: {
    // Neon glow
    glowCyan: '0 0 20px rgba(0, 240, 255, 0.6), 0 0 40px rgba(0, 240, 255, 0.3)',
    glowPurple: '0 0 20px rgba(182, 32, 224, 0.6), 0 0 40px rgba(182, 32, 224, 0.3)',
    glowPink: '0 0 20px rgba(255, 0, 110, 0.6), 0 0 40px rgba(255, 0, 110, 0.3)',
    
    // Grid patterns
    gridPattern: 'linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)',
    scanLines: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
    
    // Backdrop blur
    blur: {
      sm: 'blur(8px)',
      md: 'blur(12px)',
      lg: 'blur(16px)',
    },
  },
  
  // Animation
  animations: {
    // Matrix-style scrolling numbers
    matrixScroll: 'matrix-scroll 20s linear infinite',
    
    // Neon pulse
    neonPulse: 'neon-pulse 2s ease-in-out infinite',
    
    // Scan line
    scanLine: 'scan-line 8s linear infinite',
    
    // Glitch effect
    glitch: 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both',
  },
  
  // Component presets
  components: {
    // Card
    card: {
      base: 'bg-[#1a1a24] border border-cyan-500/20 rounded-sm',
      hover: 'hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.1)]',
      glass: 'bg-white/5 backdrop-blur-md border border-cyan-500/10',
    },
    
    // Button
    button: {
      primary: 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]',
      secondary: 'bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',
      danger: 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30',
    },
    
    // Input
    input: {
      base: 'bg-black/50 border border-cyan-500/30 text-white placeholder:text-gray-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500',
    },
    
    // Badge
    badge: {
      default: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50',
      success: 'bg-green-500/20 text-green-400 border border-green-500/50',
      warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
      danger: 'bg-red-500/20 text-red-400 border border-red-500/50',
    },
  },
};

// CSS keyframes (to be added to global CSS or Tailwind config)
export const cyberpunkKeyframes = `
  @keyframes matrix-scroll {
    0% { transform: translateY(0); }
    100% { transform: translateY(-100%); }
  }
  
  @keyframes neon-pulse {
    0%, 100% { opacity: 1; text-shadow: 0 0 20px currentColor; }
    50% { opacity: 0.8; text-shadow: 0 0 40px currentColor; }
  }
  
  @keyframes scan-line {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  
  @keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }
`;

// Utility classes
export const cyberpunkClasses = {
  // Background with grid
  gridBg: 'relative bg-[#0a0a0f] before:absolute before:inset-0 before:bg-[length:40px_40px] before:opacity-30',
  
  // Neon text
  neonText: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]',
  
  // Section divider
  divider: 'h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent',
  
  // Hover glow effect
  hoverGlow: 'transition-all hover:drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]',
};

