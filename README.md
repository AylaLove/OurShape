# Family Participation Game

A mobile-first household game built around one clear loop:

> What does our home need, who participated, and what did we accomplish together?

The repository is intentionally separate from The Hearth Mastery. It starts with typed domain rules, modular features, and a database-ready boundary so the interface never becomes the database.

## Current status

This first checkpoint contains:

- the approved product contract;
- architecture guardrails and decision records;
- a Next.js and TypeScript application shell;
- separate feature boundaries for households, quests, geometry, gratitude, and rewards;
- a code-native three-person household board;
- no real authentication or persistent data yet.

The visible data is temporary demonstration data. It must be replaced by Supabase-backed household data in the next implementation batch.

## Local setup

Node.js 20 or newer is required.

```bash
npm install
npm run dev
```

Then open `http://127.0.0.1:3000`.

Before connecting Supabase:

```bash
cp .env.example .env.local
```

Do not put real credentials in source files or commit `.env.local`.

## Quality checks

```bash
npm run check
```

The health check protects the repository from the prototype problems already encountered elsewhere: giant files, accidental local-storage truth, missing architectural boundaries, and committed secrets.

## Repository map

```text
apps/web/                 User-facing phone application
  app/                    Routes and composition only
  components/             Shared presentation components
  features/               Domain-specific interface modules
packages/domain/          Shared types and business language
supabase/                 Future migrations and database documentation
docs/                     Product contract and architecture decisions
scripts/                  Repository health checks
```

## Product name

"Family Participation Game" is a working title, not settled branding.

