# ProfiledRisk Blog Suite

Multi-blog content platform for the ProfiledRisk ecosystem. Each blog is fully independent with separate URLs, settings, templates, and analytics. Serves fraud managers and engineers with tiered technical content (Manager, Analyst, Engineer).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL 16 + Prisma 7
- **Auth**: NextAuth.js v5 (credentials-based, bcrypt)
- **Editor**: TipTap rich text with syntax highlighting (lowlight)
- **Styling**: Tailwind CSS 4 + class-variance-authority
- **Charts**: Recharts
- **PWA**: Service worker + manifest + offline fallback
- **Deployment**: Docker multi-stage build + docker-compose

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or use Docker)

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and AUTH_SECRET

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

### Docker

```bash
docker compose up -d
```

This starts PostgreSQL 16 and the Next.js app. The app is available at `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth.js secret (generate with `openssl rand -base64 32`) |

## Project Structure

```
src/
  app/
    (auth)/           # Login/register pages
    admin/seo/        # Global SEO settings (admin only)
    api/              # API routes (blogs, posts, categories, authors, analytics, search, upload)
    blog/[blogSlug]/  # Public blog renderer
    studio/           # Studio home + per-blog admin (posts, categories, authors, settings, analytics)
  components/
    blog/             # Public blog components (hero, post-card, search-bar, etc.)
    editor/           # TipTap editor, toolbar, SEO sidebar, SERP preview
    layout/           # Header, sidebar
    ui/               # Design system primitives (button, card, badge, input, etc.)
  hooks/              # Custom hooks (useDebounce)
  lib/                # Utilities (auth, prisma, seo, constants, utils)
prisma/
  schema.prisma       # Database schema
  seed.ts             # Seed script (3 users, 1 blog, categories, tags, posts)
public/
  icons/              # PWA icons
  sw.js               # Service worker
  manifest.json       # PWA manifest
  offline.html        # Offline fallback
```

## Seed Users

| Email | Password | Role |
|-------|----------|------|
| admin@profiledrisk.com | admin123 | Admin |
| editor@profiledrisk.com | editor123 | ContentManager |
| analyst@profiledrisk.com | analyst123 | Analyst |

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```
