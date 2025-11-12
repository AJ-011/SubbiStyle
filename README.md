# SubbiStyle - Ethical Fashion Platform

SubbiStyle is a digital passport system for ethical fashion that connects conscious consumers with traditional artisans. Each garment has a unique digital identity that unlocks its complete story - from the artisan who made it, to the environmental impact, to the cultural heritage behind the craft.

## 🌟 Features

- **Shop**: Browse ethically-made garments from verified brands
- **Digital Passports**: 3-tab system (Impact/Care/Culture) for each garment
- **My Passport**: Personal dashboard with stamp collection and badges
- **NFC/QR Scanning**: Claim stamps by scanning physical products
- **Brand Dashboard**: Management interface for brand partners
- **Impact Tracking**: Environmental metrics and artisan support visualization
- **Cultural Footprint**: Interactive map showing countries explored through purchases

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TanStack Query (state management)
- Wouter (routing)
- shadcn/ui + Radix UI (components)
- Tailwind CSS (styling)

### Backend
- Node.js + Express
- TypeScript
- Drizzle ORM
- PostgreSQL (Supabase)
- Supabase Auth (authentication)

### Services
- **Supabase**: Database + Authentication
- **OpenAI** (optional): AI-generated cultural content
- **Render/Replit**: Deployment platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AJ-011/SubbiStyle.git
   cd SubbiStyle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your Supabase credentials (see SETUP.md for detailed instructions)

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Seed the database**
   ```bash
   npx tsx server/seed.ts
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:5000
   ```

## 📂 Project Structure

```
SubbiStyle/
├── client/                 # Frontend React application
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers (Auth)
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities and configurations
│       └── pages/          # Route pages
├── server/                 # Backend Express application
│   ├── middleware/         # Express middleware (auth)
│   ├── db.ts               # Drizzle ORM connection
│   ├── routes.ts           # API route definitions
│   ├── seed.ts             # Database seeding script
│   └── supabase.ts         # Supabase admin client
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema + Zod validation
├── .env.example            # Environment variable template
├── drizzle.config.ts       # Drizzle ORM configuration
└── package.json            # Dependencies and scripts
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema to Supabase
- `npm run check` - Run TypeScript type checking

## 🗄 Database Schema

The application uses 15 PostgreSQL tables:

- **users** - User profiles (shoppers and brands)
- **brands** - Brand information
- **artisans** - Artisan profiles
- **garments** - Product catalog
- **nfc_codes** - NFC/QR code mappings
- **impact_metrics** - Environmental data
- **cultural_content** - Educational content
- **care_instructions** - Garment care info
- **stamps** - User's collected passports
- **badges** - Achievement system
- **user_badges** - User badge progress
- **passport_unlocks** - Section tracking
- **analytics** - User engagement data

See `shared/schema.ts` for complete schema definitions.

## 🔐 Authentication

SubbiStyle uses Supabase Auth for user authentication with two user roles:

- **Shopper**: Can browse, purchase, and collect garment passports
- **Brand**: Can add garments, manage inventory, and view analytics

## 🌐 Deployment

See [SETUP.md](./SETUP.md) for detailed deployment instructions for:
- Render
- Vercel + Railway
- Replit
- Other platforms

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Detailed setup and configuration guide
- [replit.md](./replit.md) - Technical architecture documentation
- [.env.example](./.env.example) - Environment variable reference

## 🤝 Contributing

This project uses:
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting (configured via editor)

## 📄 License

MIT

## 🆘 Support

For issues or questions:
1. Check the SETUP.md documentation
2. Review the replit.md technical docs
3. Open an issue on GitHub

## 🎯 Current Status

**Version**: 1.0 (MVP)
**Branch**: feature/debugged_and_updated
**Status**: Production-ready

### Recent Updates
- Fixed loading issues in shop and passport pages
- Added Supabase authentication integration
- Implemented timeout protection for API calls
- Added comprehensive error handling

### Known Limitations
- OpenAI integration not yet configured (optional feature)
- Using Unsplash demo images (replace in production)
- Session storage uses in-memory store (sessions lost on restart)

### Next Steps
1. Configure custom domain (if needed)
2. Set up monitoring and error tracking
3. Add end-to-end tests
4. Implement proper session persistence
5. Set up CI/CD pipeline

---

Built with ❤️ for ethical fashion and traditional artisans
