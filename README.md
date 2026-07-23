# Family Participation Game

A mobile-first household game built around one clear loop:

> What does our home need, who participated, and what did we accomplish together?

The repository is intentionally separate from The Hearth Mastery. It starts with typed domain rules, modular features, and a database-ready boundary so the interface never becomes the database.

## Current status

The repository now contains a complete playable vertical slice for one household:

- a living three-person household shape;
- adult and parent-managed child views;
- join, collaborate, hold-to-finish, endorsement, gratitude, points, rewards, and history;
- tested domain rules that prevent self-endorsement and duplicate rewards;
- recurring quest generation that preserves earlier history;
- a reviewed Flatastic import sheet;
- a Progressive Web App shell with a service worker and manifest;
- Supabase/Postgres migrations with household isolation and secure action functions.

The running interface is deliberately labelled **Private playable demo**. It uses resettable in-memory data so the product can be tested before real family accounts are connected. The database design exists, but cross-phone authentication, realtime sync, offline retry, and deployment still require a dedicated Supabase project and host credentials.

See [Implementation Status](docs/IMPLEMENTATION_STATUS.md) for the exact handoff boundary.

## Local setup

Node.js 20 or newer and pnpm are required.

```bash
pnpm install
pnpm dev
```

Then open `http://127.0.0.1:3000`.

Before connecting Supabase:

```bash
cp .env.example .env.local
```

Do not put real credentials in source files or commit `.env.local`.

## Quality checks

```bash
pnpm check
pnpm build
```

The health check protects the repository from the prototype problems already encountered elsewhere: giant files, accidental local-storage truth, missing architectural boundaries, and committed secrets.

## Repository map

```text
apps/web/                 User-facing phone application
  app/                    Routes and composition only
  components/             Shared presentation components
  features/               Domain-specific interface modules
packages/domain/          Shared types and business language
supabase/                 Postgres migrations and database documentation
docs/                     Product contract and architecture decisions
scripts/                  Repository health checks
```

## Product name

"Family Participation Game" is a working title, not settled branding.
