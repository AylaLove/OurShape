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

The child Home now uses the living household shape as the primary game surface:

- one current quest is visually prominent;
- two additional choices remain visible;
- the complete task board lives on a separate `All quests` screen;
- personal, duo, family, and open quests use meaningful geometric placement;
- demo and management information are removed from the ordinary child screen;
- child navigation is reduced to `Home`, `Thanks`, and `Treasure`.

The child experience is now divided into distinct app screens instead of one continuous
page:

- `Home` is a fixed, non-scrolling household scene;
- `All quests` is the deliberate scrolling list;
- opening a quest replaces the screen with one focused, full-height action scene;
- `Thanks` and `Treasure` remain separate destinations in the bottom navigation.

The child quest itself is now a focused action scene:

- one large quest icon and one truthful dinosaur pose;
- one spoken instruction control;
- one simple participant display;
- one obvious action at a time;
- pending work becomes a visible energy object;
- Watch Points are clearly delayed until another person sends thanks.

The dinosaur and habitat now reflect the real quest state:

- open needs invite help;
- joined work shows ready or teamwork behavior;
- completed work stays visibly carried until it is thanked;
- verified gratitude becomes persistent Home Energy and a warmer habitat;
- quiet hours still put the dinosaur to sleep without hiding pending energy.
- tapping the dinosaur gives a short state-aware hint instead of opening another dashboard;
- quest controls remain physically separate from the dinosaur at iPhone 8 and iPhone 11
  dimensions.

Home Energy now has a concrete shared purpose:

- the child sees current energy and the next household goal on Home;
- the demo goal is `Family movie night` at five verified energy;
- the child profile shows its own spendable Watch Points separately;
- Home Energy is collective and cannot be spent as personal currency.

## What is structurally implemented

- Modular Next.js and TypeScript application.
- Pure, tested domain rules for quests, endorsement, points, rewards, recurrence, and polygon balance.
- Household-scoped Postgres schema with row-level security.
- Secure database functions for household creation, child profiles, joining, completion, endorsement, and redemption.
- Immutable point and contribution ledgers.
- PWA manifest, service worker shell, and installable iPhone/Android app icons.
- Reviewable import sheet based on the supplied Flatastic screenshots.
- Architecture health checks that reject giant source files, secret leakage, and accidental browser-storage truth.
- An approved eight-pose transparent Home Dinosaur asset library.
- A live companion-state layer derived from real quest and gratitude events.
- Non-spendable Home Energy derived from uniquely endorsed quests.
- A child-first visual quest scene with speech and restrained haptic feedback.
- A four-stage daily board: Needs us, Doing, Waiting for thanks, and Celebrated.
- Optional gratitude phrases saved with the verified endorsement.
- A Supabase repository adapter that reads one profile-safe household snapshot.
- One-use expiring invitations for adding the second adult account.
- Revocable child-device access claimed through a short-lived parent code.

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

The local demo state currently resets when the page reloads. This is deliberate and visible
in the adult interface and marked as a demo on the child screen; the app does not pretend
that browser-only demo state is a database.

Mobile QA currently covers fixed 375 x 667 and 414 x 896 frames. The child Home has no
horizontal overflow, does not require page scrolling, and keeps quest controls separate
from the dinosaur at both sizes.

## Recommended next checkpoint

Connect one development Supabase project and switch the interface from the demo repository
to the prepared `SupabaseGameRepository`. Then prove the same join-to-thanks loop on two
adult accounts and one parent-managed child profile. After that proof, conduct the first
short household playtest before adding more game systems.
