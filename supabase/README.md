# Supabase boundary

The migration in this folder is the production data contract. It creates household-scoped records, immutable ledgers, audited contribution targets, row-level security, and the transactional gratitude function that prevents duplicate rewards.

No remote project is connected yet. Create a dedicated development project rather than reusing The Hearth or Zamkee credentials, then apply migrations in development first.

Real credentials belong in `.env.local`, never in this directory.

The local app deliberately remains in labelled demo mode until those credentials exist. Demo state is resettable and is not a substitute for cross-phone persistence.
