# Supabase boundary

The migrations in this folder are the production data contract. They create household-scoped records, immutable ledgers, audited contribution targets, row-level security, transactional gratitude, a profile-safe household snapshot, and one-use adult invitations.

No remote project is connected yet. Create a dedicated development project rather than reusing The Hearth or Zamkee credentials, then apply migrations in development first.

Real credentials belong in `.env.local`, never in this directory.

The local app deliberately remains in labelled demo mode until those credentials exist. Demo state is resettable and is not a substitute for cross-phone persistence.

Apply migrations in filename order. The corresponding application adapters are:

- `apps/web/lib/supabase-game-repository.ts`
- `apps/web/lib/supabase-household-onboarding.ts`
