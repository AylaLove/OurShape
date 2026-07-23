# Implementation Status

## What can be clicked through now

The private playable demo proves the intended household loop:

1. Choose Ayla, Raen, or Sage.
2. Open a household quest and join it.
3. Hold to mark the work done.
4. Switch to a non-participant and send thanks.
5. See appreciation points and contribution evidence awarded once.
6. Review gratitude and chronological household history.

The child profile uses simpler language, spoken quest instructions, large controls, Watch Points, child-safe rewards, and a supportive family view without individual balance ratios.

## What is structurally implemented

- Modular Next.js and TypeScript application.
- Pure, tested domain rules for quests, endorsement, points, rewards, recurrence, and polygon balance.
- Household-scoped Postgres schema with row-level security.
- Secure database functions for household creation, child profiles, joining, completion, endorsement, and redemption.
- Immutable point and contribution ledgers.
- PWA manifest and service worker shell.
- Reviewable import sheet based on the supplied Flatastic screenshots.
- Architecture health checks that reject giant source files, secret leakage, and accidental browser-storage truth.
- An approved eight-pose transparent Home Dinosaur asset library.
- A live companion-state layer derived from real quest and gratitude events.
- Non-spendable Home Energy derived from uniquely endorsed quests.
- A four-stage daily board: Needs us, Doing, Waiting for thanks, and Celebrated.
- Optional gratitude phrases saved with the verified endorsement.
- A Supabase repository adapter that reads one profile-safe household snapshot.
- One-use expiring invitations for adding the second adult account.

## What still needs external setup

These are not honest to claim without a real Supabase project and private preview host:

- adult authentication and invitation;
- three-phone realtime synchronization;
- persistent household data;
- offline action retry;
- push notifications and quiet hours;
- backup and monitoring verification;
- automated database policy tests against two real households;
- a seven-day household beta;
- friend-household onboarding and template packs.

## Recommended next checkpoint

Connect one development Supabase project and switch the interface from the demo repository to the prepared `SupabaseGameRepository`. Then prove the same join-to-thanks loop on two adult accounts and one parent-managed child profile. After that proof, conduct the first short household playtest before adding more game systems.
