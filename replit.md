# ProofOfInfluence

## Overview

ProofOfInfluence (POI) is a Web3 influence monetization platform developed by ACEE Ventures. The platform enables creators and brands to convert influence into tangible value through $POI tokens, combining a spot trading market, RWA (Real-World Asset) marketplace, and merchant ecosystem. Built on Base blockchain with Uniswap V2 integration for decentralized trading.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18+ with TypeScript for type-safe component development
- Vite as build tool and development server with hot module replacement
- Wouter for lightweight client-side routing
- TailwindCSS for utility-first styling with custom design system
- shadcn/ui component library (Radix UI primitives) for accessible UI components

**State Management**
- TanStack Query (React Query) for server state management and data fetching
- Local React state (useState/useReducer) for UI-specific state
- No global state management library needed due to React Query's caching

**Design System**
- Custom Tailwind configuration with dark/light theme support
- Design tokens defined in CSS variables (HSL color system)
- Mobile-first responsive design with breakpoints at 768px (md) and 1024px (lg)
- Gradient-driven visual identity inspired by Rainbow.me and Gradient.page aesthetics
- Inter font family for primary text, JetBrains Mono for technical elements

**Routing Strategy**
- Public routes (/, /products, /for-creators, etc.) accessible without authentication
- Protected routes (/app, /app/market, /profile) require authentication
- Dynamic username routes (/@username) for public profile cards
- All routes configured in client/src/App.tsx

### Backend Architecture

**Server Framework**
- Express.js for RESTful API with TypeScript
- Session-based authentication using express-session with PostgreSQL store
- Passport.js with OpenID Connect for Replit Auth integration

**API Design**
- RESTful endpoints organized by feature modules (/api/market, /api/reserve, /api/merchant)
- Zod schemas for request validation at route level
- Consistent error handling with HTTP status codes
- CORS configured for ChatGPT.com origin (Custom GPT integration)

**Authentication & Authorization**
- Replit Auth as primary authentication provider (OAuth/OIDC)
- Role-based access control (user, merchant, admin)
- Web3 wallet connection as optional secondary auth method
- Session management with 7-day cookie expiration

**Role-Based Access Control**
- Guest: Public pages only
- Web3 Connected: Basic trading features
- KYC Verified: Full platform access including withdrawals
- Merchant: Product management and order processing
- Admin: Reserve pool management and system configuration
- Development mode override: DEV_MODE_ADMIN=true grants all users admin access (server-enforced)

### Data Storage

**Database**
- PostgreSQL as primary relational database via Neon serverless
- Drizzle ORM for type-safe database queries and schema management
- Schema organized into logical tables: users, profiles, links, transactions, market orders, products, etc.

**Schema Design Philosophy**
- Users table: Authentication and account management (Replit + Web3)
- Profiles table: Public showcase information (bio, links, social media)
- Transactional tables: Separate tables for market orders, trades, merchant orders, reserve actions
- JSONB fields for flexible metadata storage where appropriate

**Data Migration**
- Drizzle Kit for schema migrations (drizzle.config.ts)
- Migration files stored in /migrations directory
- Database schema defined in shared/schema.ts

### External Dependencies

**Blockchain Integration**
- Wagmi hooks for Web3 wallet interactions (useAccount, useBalance, useSwitchChain)
- Reown AppKit (formerly WalletConnect) for multi-wallet support
- Base blockchain (Chain ID: 8453) as primary network, with support for Base Sepolia testnet
- BaseSwap DEX (Uniswap V2 fork) for token swaps
- Ethers.js v5 for smart contract interactions and transaction signing

**Smart Contracts**
- POI Token: ERC20 standard token with upgradeable pattern (OpenZeppelin)
- Uniswap V2 Router integration for decentralized swaps
- Contract deployment via Hardhat (hardhat.config.cjs) or standalone TypeScript scripts
- Deployments tracked in deployments/ directory as JSON files

**Payment Processing**
- Stripe for fiat payments (checkout sessions, webhooks)
- USDC as primary stablecoin for crypto payments on Base
- Fee credit system for POI token holders (discounts on platform fees only, not item prices)

**Third-Party APIs**
- GitHub REST API (@octokit/rest) for issue management via Custom GPT
- Slack API for AI coordination notifications (optional, gracefully degrades if not configured)
- TradingView widget for real-time price charts

**API Server for AI Coordination**
- Standalone Express server (api-server/) for ChatGPT Custom GPT integration
- Proxy endpoint in main server (/api-gpt/*) forwards to API server on port 3001
- Creates GitHub issues with AI agent assignments (@cursor, @codex, @replit labels)
- Optional Slack notifications to channels (#ai-coordination, #cursor-dev, etc.)

### Deployment & Operations

**Environment Configuration**
- Development: Local with Vite dev server and tsx for backend hot reload
- Production: Vite build → static assets served from dist/public, Express serves API
- Environment variables managed via .env files (local) or Replit Secrets (production)

**Build Process**
- Frontend: Vite builds React app to dist/public
- Backend: esbuild bundles server/index.ts to dist/index.js as ESM module
- Smart Contracts: Hardhat compiles Solidity to artifacts/ directory

**Network Support**
- Mainnet: Ethereum, Base, Arbitrum, Polygon
- Testnets: Sepolia, Base Sepolia
- Default network: Base (production), Base Sepolia (testing)
- RPC URLs configurable via environment variables or use public endpoints

**Critical Environment Variables**
- DATABASE_URL: PostgreSQL connection string (required)
- SESSION_SECRET: Express session encryption key (required)
- STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY: Payment processing
- VITE_WALLETCONNECT_PROJECT_ID: WalletConnect/AppKit integration
- PRIVATE_KEY: Wallet for smart contract deployment (local development only)
- GITHUB_TOKEN, API_SECRET_KEY: Custom GPT API server
- SLACK_BOT_TOKEN: Optional Slack integration

**Mock vs Real API Mode**
- Market module: Real API enabled by default (backend complete)
- Reserve Pool: Mock API default (use VITE_USE_MOCK_RESERVE=false when backend ready)
- Merchant: Mock API default (use VITE_USE_MOCK_MERCHANT=false when backend ready)
- Flexible per-module control via environment variables for progressive integration