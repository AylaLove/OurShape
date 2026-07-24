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

- the triangle, household members, Home Energy, and dinosaur communicate household state;
- chores no longer float over or obscure the family shape;
- all task selection lives on the separate `Quests` screen;
- demo and management information are removed from the ordinary child screen;
- child navigation is `Home`, `Quests`, `Thanks`, and `Treasure`.

The child experience is now divided into distinct app screens instead of one continuous
page:

- `Home` is a fixed, non-scrolling household scene;
- `Quests` is the deliberate scrolling list;
- opening a quest replaces the screen with one focused, full-height action scene;
- `Thanks` and `Treasure` remain separate destinations in the bottom navigation.

The child quest itself is now a focused action scene:

- one large quest icon and one truthful dinosaur pose;
- one spoken instruction control;
- one simple participant display;
- one obvious action at a time;
- pending work becomes a visible energy object;
- Watch Points are clearly delayed until another person sends thanks.

Repair Missions now provide a bounded consequence loop:

- an adult chooses the person, mission, and exact repair instruction;
- the targeted person is the only person who can complete that repair;
- earned appreciation points remain intact;
- Treasure waits while that person's Repair Mission is open;
- the repair awards no new points or contribution credit;
- another household member must acknowledge the repair before Treasure reopens;
- creation and completion remain visible in household history.

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
- Repair Missions with target enforcement, reward locking, non-credit completion, acknowledgement, and audit history.

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
horizontal overflow, does not require page scrolling, and no longer places task controls
over the dinosaur or household shape at either size.

## Recommended next checkpoint

Connect one development Supabase project and switch the interface from the demo repository
to the prepared `SupabaseGameRepository`. Then prove the same join-to-thanks loop on two
adult accounts and one parent-managed child profile. After that proof, conduct the first
short household playtest before adding more game systems.
