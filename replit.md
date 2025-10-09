# Subbi - Ethical Fashion-Tech Platform

## Overview
Subbi is an ethical fashion-tech platform where users collect digital stamps from garment purchases. Each garment has an NFC/QR code that unlocks a stamp on the user's passport, providing access to environmental impact data, care instructions, and cultural archives about the artisan heritage behind the piece.

**Current Status**: MVP implementation with in-memory storage, ready for testing
**Last Updated**: October 9, 2025

## Architecture

### Frontend (React + TypeScript)
- **Stack**: React 18, TypeScript, Vite, Wouter (routing), TanStack Query, Tailwind CSS + shadcn/ui
- **Pages**:
  - `/` - Home page (public)
  - `/shop` - Garment catalog with filtering/search (public)
  - `/garment/:id` - Garment stamp detail with Impact/Care/Culture tabs (public)
  - `/passport` - User's personal passport with stamps and badges (login required)
  - `/brand` - Brand dashboard for onboarding garments (public for demo)
- **Components**: NFC/QR scanner, stamp cards, badge displays, filters, search

### Backend (Express + Node.js)
- **Stack**: Express, TypeScript, PostgreSQL schema (via Drizzle ORM)
- **Storage**: In-memory storage (MemStorage) for MVP development
- **API Routes**:
  - `GET /api/garments` - List all garments with optional filters
  - `GET /api/garments/:id` - Get garment details
  - `GET /api/brands` - List all brands
  - `GET /api/brands/:id` - Get brand details
  - `GET /api/nfc-codes/:code` - Validate NFC/QR code
  - `GET /api/user/passport` - Get user passport with stamps and badges
  - `POST /api/user/stamps` - Claim a stamp via NFC/QR code
  - `POST /api/garments` - Create new garment (brand dashboard)

### Database Schema
- **garments** - Product catalog with name, description, price, images, category, brand
- **brands** - Brand profiles with origin, philosophy, sustainability practices
- **artisans** - Artisan profiles with country, craft, bio
- **nfc_codes** - NFC/QR code mappings to garments
- **impact_metrics** - Environmental metrics (water saved, CO2 offset, artisans supported, supply chain)
- **cultural_content** - Educational content (history, techniques, vocabulary) organized by tabs
- **care_instructions** - Garment care steps and materials
- **user_stamps** - User's collected stamps from purchases
- **badges** - Achievement badges with unlock criteria
- **user_badges** - User's earned badges

## Authentication Requirements

### Public (No Login Required)
- Homepage browsing
- Shop catalog (view all garments, filter by category/brand, search)
- Garment detail pages (Impact, Care, Culture tabs)
- Brand pages and stories
- All cultural content and educational materials

### Login Required
- Personal passport page (`/passport`)
- Stamp collection tracking
- Badge achievements
- Environmental impact totals
- NFC/QR code scanning to claim stamps

**Integration**: Replit Auth (javascript_log_in_with_replit) for OIDC authentication

## Data Model

### Key Types (shared/schema.ts)
```typescript
// Garments with all metadata
Garment: id, name, description, price, imageUrl, category, brandId, artisanId

// Impact metrics - stored as NUMERIC values, formatted on display
ImpactMetrics: waterSaved (string), co2Offset (string), artisansSupported (number)

// Cultural content organized by tabs
CulturalContent: type (history|technique|vocabulary), title, content, images

// User passport data
UserPassport: user, stamps[], badges[], totalImpact
```

### Storage Strategy
- **MVP**: In-memory storage (MemStorage class) for rapid development
- **Production Ready**: PostgreSQL schema defined, ready to switch
- **Note**: All impact metrics must be stored as numeric strings (e.g., "2500") not formatted text (e.g., "2,500 liters") to enable aggregation

## Seed Data (Development)

### Garments (3 items)
1. **Huipil de Flores** - Traditional Guatemalan embroidered blouse
   - Brand: Threads of Heritage
   - Artisan: María Elena Tuyuc (Guatemala)
   - Category: Clothing
   - Impact: 2,500L water saved, 12kg CO2 offset, 3 artisans
   
2. **Kaftan Azul** - Moroccan silk embroidered kaftan
   - Brand: Desert Rose Collective
   - Artisan: Fatima Benali (Morocco)
   - Category: Clothing
   - Impact: 3,200L water saved, 18kg CO2 offset, 5 artisans

3. **Indigo Tenugui** - Japanese shibori-dyed cotton scarf
   - Brand: Desert Rose Collective
   - Artisan: Kenji Yamamoto (Japan)
   - Category: Accessories
   - Impact: 1,800L water saved, 8kg CO2 offset, 2 artisans

### Demo User
- **Name**: Sarah Martinez (user-1)
- **Stamps**: 2 collected (garment-1, garment-2)
- **Badges**: 1 earned ("First Steps" - collect first stamp)
- **Total Impact**: 5,700L water saved, 30kg CO2 offset, 8 artisans supported

### Available Badges (3)
- First Steps - Collect your first stamp
- Culture Keeper - Collect 5 stamps
- Global Citizen - Collect stamps from 3+ countries

## Design System

### Theme
- **Inspiration**: Editorial (Vogue x National Geographic)
- **Colors**: Soft earth tones, cream backgrounds, sage green accents
- **Typography**: Clean serif headers, readable sans-serif body
- **Visual Elements**: Stamp-inspired cards, passport aesthetic, textile textures

### Component Library
- shadcn/ui components (buttons, cards, dialogs, forms, badges)
- Lucide React icons
- Tailwind CSS for styling
- Dark mode support (planned)

## Recent Changes

### October 9, 2025
- ✅ Fixed all 33 TypeScript/LSP errors
- ✅ Fixed PostCSS opacity syntax error
- ✅ Implemented comprehensive seed data (3 garments, 2 brands, 3 artisans)
- ✅ Fixed impact metrics to use numeric values for aggregation
- ✅ Added complete cultural content (history, techniques, vocabulary) for all garments
- ✅ Added supply chain steps for all garments
- ✅ Documented authentication requirements (public browsing vs login-required passport)

## User Preferences
- Minimize the number of files (collapse similar components)
- Focus on core passport functionality (deprioritize AI-powered storytelling for now)
- Use in-memory storage for MVP (database schema ready for production)
- Public browsing for all catalog/educational content
- Login only required for personal passport page

## Next Steps
1. Test all pages with comprehensive seed data
2. Implement authentication protection on passport page
3. Add user-facing formatting for impact metrics (display with units)
4. Test NFC/QR code scanning flow
5. Verify badge unlocking logic
6. Consider migration path to PostgreSQL database
