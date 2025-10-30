# Design Guidelines: Linktree-Style Web3 Link-in-Bio Platform

## Design Approach

**Reference-Based Design:** Primary inspiration from Linktree with Web3-native enhancements
**Key References:** Linktree, Rainbow.me (Web3 wallet), Carrd (minimalist link pages)
**Design Principles:** Mobile-first simplicity, centered hierarchy, wallet-first identity, clean interaction patterns

## Typography System

**Font Families:**
- Primary: Inter or DM Sans (modern, highly legible sans-serif)
- Accent: Space Grotesk for wallet addresses (monospaced aesthetic)

**Type Scale:**
- Profile Name: text-2xl md:text-3xl font-bold
- Bio/Description: text-base md:text-lg font-normal
- Link Buttons: text-base md:text-lg font-medium
- Wallet Address: text-sm font-mono
- Analytics/Metadata: text-xs md:text-sm font-normal
- Section Headers: text-lg font-semibold

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4 to p-6
- Section spacing: space-y-4 to space-y-6
- Container margins: mx-4 md:mx-auto
- Button gaps: gap-3

**Container Strategy:**
- Main content: max-w-md (448px) centered with mx-auto
- Full-width sections for edit mode: max-w-4xl
- Mobile: px-4 py-6
- Desktop: px-6 py-8

**Grid Application:**
- Single column for public profile (Linktree pattern)
- Two-column for edit mode: sidebar (preview) + main (controls)
- Analytics grid: grid-cols-2 for click stats

## Component Library

### Navigation & Header
**Web3 Wallet Connection Button:**
- Prominent placement: top-right of edit mode
- Two states: "Connect Wallet" (disconnected) / Truncated address (connected)
- Include wallet icon (MetaMask/WalletConnect logo)
- Dropdown on click showing full address, disconnect option
- Copy address functionality with feedback toast

**Edit Mode Navigation:**
- Fixed top bar with app logo, wallet connection, save/publish buttons
- Sticky positioning for persistent access

### Profile Section (Public View)
**Profile Card:**
- Centered avatar: w-24 h-24 md:w-28 md:h-28, rounded-full with subtle border
- Profile name directly below (text-2xl md:text-3xl)
- Bio text (text-base, max-w-xs, centered, text-wrap-balance)
- Connected wallet address display (truncated with copy button)
- Total profile views/clicks counter
- Spacing: space-y-3 between elements

### Link Buttons (Core Component)
**Design Pattern:**
- Full-width within container (w-full)
- Rounded corners: rounded-xl to rounded-2xl
- Padding: py-4 px-6
- Typography: text-base md:text-lg font-medium, text-center
- Stacked vertically with space-y-3
- Icon support (left-aligned): 20x20 size with mr-3
- Click count badge (right-aligned, text-xs)
- Smooth hover lift effect: hover:-translate-y-1 transition-transform

**Link Types:**
- Standard links (URL)
- Web3 wallet payment (ETH/crypto address display)
- Social links with platform icons
- Email/contact links

### Edit Mode Components

**Link Editor Card:**
- Drag handle icon (left edge, 6-dot grid pattern)
- Link preview thumbnail
- Title input field (text-base)
- URL input field (text-sm, font-mono)
- Toggle visibility switch
- Delete button (right edge, trash icon)
- Spacing: p-4 with gap-3 between inputs

**Add Link Button:**
- Full-width, dashed border style
- Text: "Add New Link" with plus icon
- Padding: py-6
- Positioned below existing links

**Customization Panel:**
- Avatar upload zone (circular preview with overlay controls)
- Profile name input
- Bio textarea (max 160 characters, counter shown)
- Theme selector (grid of theme presets)
- Background options (gradients, solids, patterns)

### Drag-and-Drop Interface
- Visual grab cursor on hover over drag handle
- Dragging state: reduced opacity (opacity-60), slight scale (scale-105)
- Drop zone indicators: dashed borders with subtle highlight
- Smooth reorder animations: transition-all duration-200

### Analytics Dashboard
**Metrics Display:**
- Total clicks card: Large number (text-4xl) with label
- Per-link breakdown: Two-column grid showing link title + click count
- Chart visualization: Simple bar chart for top 5 links
- Time period selector: Last 7 days, 30 days, all time

### Web3-Specific Components

**Wallet Address Display:**
- Full address on hover/click
- Truncated format: 0x1234...5678 (first 6, last 4 characters)
- Etherscan link icon (external link indicator)
- Copy button with success feedback
- Network indicator badge (Ethereum, Polygon, etc.)

**ENS/Domain Integration:**
- Display ENS name if available (primary, larger text)
- Show wallet address as secondary (smaller, beneath ENS)

### Forms & Inputs
**Text Inputs:**
- Border-style with focus ring
- Padding: py-3 px-4
- Rounded: rounded-lg
- Labels: text-sm font-medium mb-1.5
- Helper text: text-xs mt-1

**Toggle Switches:**
- iOS-style toggle for link visibility
- Active state clearly distinguished
- Label placement: left of switch

### Buttons
**Primary CTA (Save, Publish):**
- Padding: py-3 px-8
- Rounded: rounded-lg
- Font: text-base font-semibold
- Width: auto (inline) for navigation, full-width for mobile CTAs

**Secondary Actions (Cancel, Delete):**
- Outlined or ghost style
- Same padding/rounding as primary
- Destructive actions use red accent (without specifying color)

**Icon Buttons:**
- Square aspect ratio: w-10 h-10
- Centered icon: 20x20
- Rounded: rounded-lg
- Used for copy, external link, delete, drag handle

### Public Profile Layout Structure
1. **Header**: Profile avatar + name + bio + wallet address (space-y-3)
2. **Links Section**: Stacked link buttons (space-y-3, mt-8)
3. **Footer**: Subtle "Powered by [App Name]" badge (mt-12, text-xs)

### Edit Mode Layout Structure
**Two-Panel Layout (Desktop):**
- Left Panel (40%): Live preview (sticky, max-h-screen overflow-auto)
- Right Panel (60%): Edit controls (scrollable)
- Mobile: Single column, preview at top, collapsible

**Right Panel Sections:**
1. Profile settings
2. Links manager (draggable list)
3. Add link button
4. Appearance customization
5. Analytics view (separate tab/section)

## Images

**Profile Avatar:** User-uploaded circular photo, 112x112 (desktop), supports PNG/JPG, with upload/crop interface in edit mode

**Link Thumbnails (Optional):** Small 40x40 icon/logo for branded links (YouTube, Twitter, etc.), displayed to left of link text

**Background Patterns:** Decorative gradients or subtle geometric patterns as page backgrounds (not images, generated via CSS)

**No Hero Image Required:** This is a single-page app focused on centered content, not a landing page with hero section

## Accessibility & Interaction

- All interactive elements: min-height of 44px (touch-friendly)
- Focus indicators on all interactive elements
- Keyboard navigation for drag-and-drop (arrow keys + space)
- ARIA labels for icon-only buttons
- Screen reader announcements for wallet connection status
- High contrast between text and backgrounds
- Alt text for profile avatars

## Responsive Breakpoints

- Mobile: Base styles, single column, full-width buttons
- Tablet (md: 768px): Slightly larger typography, two-column edit layout begins
- Desktop (lg: 1024px): Optimal two-panel edit view, larger preview size

## Animation Guidelines

**Use Sparingly:**
- Link button hover lift (subtle, -2px translate)
- Wallet connection loading spinner
- Drag-and-drop reorder animations (smooth 200ms transitions)
- Success toasts (slide-in from top)
- No parallax, no scroll-triggered animations, no auto-playing elements

**Critical Interactions:**
- Immediate visual feedback on wallet connection (loading → success state)
- Smooth reordering when dragging links
- Toast notifications for copy actions, save confirmations

This design creates a familiar Linktree experience enhanced with Web3 wallet functionality while maintaining simplicity and mobile-first usability.