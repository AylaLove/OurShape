# Our Shape Readiness Audit

**Date:** 3 August 2026  
**Audit type:** Read-only product, architecture, data, and handoff review  
**Current verdict:** Household alpha. Not ready for an unsupervised friend beta yet.

## Plain-Language Summary

Our Shape is no longer a loose static prototype. It has a real application structure, a tested game-rules layer, a Supabase/Postgres database, secure server actions, and separate interface components. This is a major improvement over the original Hearth simulator architecture.

The central idea is also coherent:

`Needs Doing -> Join -> Do -> Waiting for Thanks -> Endorsed -> Gratitude + High Fives + Home Energy + History`

The main remaining problem is **trust**. A few important shared-household paths can stop halfway, show success when the database failed, expose adult progress details to a child response, or require developer help to complete. These issues should be repaired before inviting friends.

## Intended Product Standard

Our Shape should:

- Make **How can I help?** the clearest action.
- Show what needs doing, who joined, what was finished, and who noticed it.
- Reward participation without ranking or shaming family members.
- Require another person to confirm ordinary completed work.
- Keep High Fives, Home Energy, gratitude, and contribution evidence distinct.
- Use calm Repair Missions instead of removing earned points.
- Let adults manage the household while keeping the child's experience simple and safe.
- Keep every household's people and history private from every other household.
- Work consistently across the family's phones.
- Preserve history rather than silently rewriting it.

## What Is Working Well

### Architecture

- The app is split into a Next.js interface, reusable feature components, a domain package, a repository layer, and database migrations.
- Core game rules are not trapped in one giant page.
- Environment files are excluded from Git, and the audit found no obvious tracked private credentials.
- Household-owned data consistently uses household identifiers in the main schema.
- The production build, TypeScript check, project-health check, schema check, and all 49 automated tests pass.

### Game Rules

- Quest participation is stored separately from the person who marks work finished.
- A participant cannot endorse their own completion.
- Duplicate participation, completion, and endorsement are protected at database level.
- Points and contribution evidence are awarded after acknowledgement.
- Shared work gives each participant the full appreciation reward while dividing contribution units.
- Repair Missions do not award points.
- Reward spending uses a ledger rather than changing a balance invisibly.

### Experience

- The child flow has a focused **How can I help?** route.
- The Home shape, Quests, Thanks, Treasure, and profiles have distinct purposes.
- Custom one-off quests can be added with a title, instruction, scope, category, participant suggestion, and effort value.
- Spoken guidance, reduced-motion styling, mobile sizing, and installable-app metadata are present.
- The current logo concept reflects the household geometry and primary colours.

## Readiness Snapshot

| Area | Status | Meaning |
| --- | --- | --- |
| Demo prototype | Strong | Suitable for design testing and supervised walkthroughs. |
| Core quest rules | Strong | The rule layer and secure database actions are thoughtful. |
| Adult email sign-in | Working | Recent fixes address redirects, email errors, and membership discovery. |
| First household setup | Fragile | It can stop halfway and leave partial data. |
| Child phone access | Incomplete | Database support exists, but the parent-facing setup controls do not. |
| Thanks and points | Mostly working | One interface bug can celebrate a failed database action. |
| Daily capacity and intentions | Demo only | The shared version says this is a future batch. |
| Household editing | Partial | New one-off quests work; editing, schedules, rewards, and members are incomplete. |
| Multi-phone updates | Weak | Other phones generally need a refresh. |
| Friend households | Not ready | Privacy tests, child access, setup recovery, and multi-household handling remain. |

## Priority Findings

### P0: Fix Before Real Family Use

#### 1. The interface can celebrate a database failure

The shared action helper catches an error without reporting failure back to the caller. The Thanks flow then shows gratitude, sound, vibration, points, and Home Energy as though the action succeeded.

Files:

- `apps/web/features/game/use-live-game-actions.ts`
- `apps/web/features/game/GameShell.tsx`

**Why this matters:** the child or adult could believe a thank-you and points were saved when they were not.

**Repair:** make every live action return an explicit success result. Only celebrate after the server confirms success.

#### 2. First setup is several separate operations

Household creation, child creation, starter quests, and invitation creation happen one after another in the browser.

File: `apps/web/features/shared/SharedOnboarding.tsx`

**Why this matters:** if operation three fails, operations one and two remain. This is the same class of partial-setup problem already encountered during setup.

**Repair:** move initial setup into one database transaction, or make it safely resumable and idempotent.

#### 3. Child snapshots include adult balance data

The household snapshot includes every member's contribution target and the household contribution ledger, including when the target profile is a child.

File: `supabase/migrations/202607230001_household_snapshot.sql`

**Why this matters:** the interface may hide these details, but private information should not be sent to the child device at all.

**Repair:** return a restricted child snapshot from the database, not merely a visually simplified adult snapshot.

#### 4. Direct quest-table permissions need tightening

Adults have broad row policies for daily quests, while the audit did not find a matching revocation of direct write privileges from authenticated users.

File: `supabase/migrations/202607240003_repair_mission_actions.sql`

**Why this matters:** secure actions contain the audit and game rules. Direct writes could bypass them if the live grants permit it.

**Repair:** verify live grants and require normal app changes to pass through secure database functions.

### P1: Fix Before Friend Testing

#### 5. Child-device access has no usable parent interface

The repository can create, claim, and revoke child-device access, but the adult screens do not expose the workflow.

Files:

- `apps/web/lib/supabase-household-onboarding.ts`
- `apps/web/features/shared/SharedControls.tsx`

**Result today:** Sage cannot be connected to a real child profile without developer intervention.

#### 6. Live daily capacity and intentions are not implemented

The demo can edit them, but the shared screen explicitly says the live version belongs to a later batch.

File: `apps/web/features/game/GameShell.tsx`

**Repair:** add a learner/member-scoped daily-plan record and secure save/read actions. Keep menstrual dates private; share only the chosen support or capacity signal.

#### 7. Rewards stop halfway through their consent lifecycle

Rewards can be requested and points can be deducted, but the shared app does not provide the full accept, decline, fulfil, or refund path for person-provided rewards.

Files:

- `apps/web/features/rewards/RewardsView.tsx`
- `supabase/migrations/202607220002_secure_actions.sql`

**Repair:** complete the adult acknowledgement workflow and define exactly when points are held, spent, or returned.

#### 8. New households are barely seeded

Initial setup adds only three quests and does not create an editable starter reward set.

File: `apps/web/features/shared/SharedOnboarding.tsx`

**Repair:** seed a small reviewable starter pack, then let the owner edit or remove every item.

#### 9. Old point names remain in database setup

Older migrations still create `Chill Points` or `Watch Points`, although the current product language is `High Fives`.

Files:

- `supabase/migrations/202607220002_secure_actions.sql`
- `supabase/migrations/202607230002_household_invites.sql`

**Repair:** add a forward migration that normalises current household labels without rewriting ledger history.

#### 10. Other phones do not update automatically

The current shared repository reloads after an action on the same device but does not subscribe to Supabase changes.

**Result today:** one family member may finish a quest while another person's screen remains stale until refreshed.

**Repair:** add a household-scoped realtime refresh signal, with a visible manual refresh fallback.

#### 11. Security is not tested against a real database

The 49 tests are useful unit and static checks, but they do not prove that one household cannot read another, that a child cannot access adult information, or that simultaneous phones cannot award twice.

**Repair:** add Supabase integration tests using two households, two adults, and one child profile.

### P2: Complete the Product Promise

#### 12. “Maximum editing” is only partly delivered

Adults can create custom one-off quests. They cannot yet fully:

- edit, cancel, carry, or reschedule an existing quest;
- create custom categories;
- create recurring schedules;
- manage tomorrow's generated list;
- create and reprice rewards;
- change household members, symbols, colours, and targets in the live app.

#### 13. Adult Home still carries a quest list

The child Home is focused, while the adult Home also renders the full quest list beneath the shape.

File: `apps/web/features/game/TodayView.tsx`

**Repair:** keep Home as household status and put task browsing in Quests for both adults and children.

#### 14. Multiple-household membership is not supported cleanly

The shared entry expects one active membership. An adult who belongs to two households can hit a single-row error.

File: `apps/web/features/shared/SharedApp.tsx`

**Repair:** add a household selector before inviting friend families or supporting separated/custody households.

#### 15. Offline fallback can show the wrong experience

The service worker can return the demo root when the shared route fails offline.

File: `apps/web/public/sw.js`

**Repair:** show an honest shared-home offline screen and queue no state-changing action until a deliberate offline strategy exists.

#### 16. Generated build folders are tracked

Folders such as `apps/web/out 3`, `out 4`, and `out 6` contain generated files and slipped past ignore rules because of their names.

**Repair:** remove them from version control after confirming they are not deployment inputs, then harden `.gitignore`.

#### 17. Styling is becoming another maintenance risk

`views.css`, `game.css`, and `globals.css` together contain thousands of lines, but the current size guard does not protect CSS.

**Repair:** split styles by screen/component as those screens are touched. Do not perform a visual rewrite all at once.

#### 18. Dialog accessibility needs a final pass

Dialogs have useful roles and labels, but the audit did not find complete focus trapping, Escape handling, or focus restoration.

**Repair:** add one reusable accessible dialog primitive and migrate dialogs gradually.

## Repair Roadmap: Maximum Two Hours Per Increment

Every increment must end with passing checks and one visible, testable result.

### Batch A: Make Shared State Truthful

1. **Action success contract — 60–90 min**  
   Stop false celebrations and add a failing-then-passing test.

2. **Atomic setup design — 60–90 min**  
   Specify the single setup input/output, retry rules, and rollback behaviour.

3. **Atomic or resumable setup implementation — 90–120 min**  
   Implement the setup function and test a deliberate mid-setup failure.

4. **Child snapshot privacy — 90–120 min**  
   Remove adult contribution targets and ledgers from child responses.

5. **Database write-boundary check — 60–90 min**  
   Inspect live grants, add revocations where required, and prove secure actions still work.

6. **High Fives terminology migration — 60–90 min**  
   Normalise labels in new and existing households without changing earned history.

### Batch B: Complete One Real Household

7. **Child-device connection screen — 90–120 min**  
   Let an adult generate, view, and revoke Sage's connection safely.

8. **Live identity editing — 60–90 min**  
   Save household name, slogan, symbols, and colours through secure actions.

9. **Daily plan database contract — 90–120 min**  
   Add capacity and intended quests with private-cycle boundaries.

10. **Daily plan interface wiring — 90–120 min**  
    Replace demo-only saves and test each family member separately.

11. **Reward consent actions — 90–120 min**  
    Add accept, decline, fulfil, and refund rules.

12. **Reward management screen — 90–120 min**  
    Let adults add, edit, price, pause, and remove household rewards.

13. **Starter household pack — 60–90 min**  
    Seed editable quests and rewards without hardcoding the household's future routine.

### Batch C: Make Three Phones Feel Like One Home

14. **Realtime refresh — 90–120 min**  
    Refresh household state when another phone changes it.

15. **Adult Home simplification — 60–90 min**  
    Keep the shape and central help action; move the full list to Quests.

16. **Quest editing — 90–120 min**  
    Add edit, cancel, carry, and reschedule with audit history.

17. **Recurring quest templates — 90–120 min**  
    Create schedules without requiring daily adult administration.

18. **Accessible dialog primitive — 60–90 min**  
    Add focus management and migrate the highest-use sheets first.

19. **iPhone 8 and 11 visual pass — 90–120 min**  
    Test real screen sizes, keyboard, safe areas, long names, and large text.

20. **Offline truthfulness — 60–90 min**  
    Replace the misleading demo fallback with a clear reconnect state.

### Batch D: Friend-Beta Gate

21. **Cross-household security tests, part 1 — 90–120 min**  
    Prove two adult households cannot read or change one another.

22. **Child security tests, part 2 — 90–120 min**  
    Prove child responses omit adult-only data and actions.

23. **Multi-household selector — 90–120 min**  
    Support adults participating in more than one household.

24. **One-friend onboarding rehearsal — 90–120 min**  
    Observe setup without coaching and record every hesitation or failure.

## Acceptance Gate Before Inviting Friends

Do not call the app friend-beta ready until all of these are true:

- A failed server action never produces a success celebration.
- Setup can be retried without duplicate or partial households.
- A child device receives only child-appropriate data.
- Sage can connect without developer intervention.
- Two phones see a quest, completion, and thanks update promptly.
- A participant cannot endorse themselves or receive duplicate rewards.
- Reward requests have an explicit accept/decline/fulfil/refund path.
- Adults can customise core quests and rewards without editing code.
- One household cannot read, infer, or change another household's data.
- iPhone 8 and iPhone 11 show no overlap or horizontal overflow.
- Offline or broken connections never quietly open a misleading demo state.

## Logo Recommendation

The current logo is structurally sensible: it uses household geometry and the three primary colours. It is also simple enough to work as an app icon.

What it lacks is a memorable emotional signal. It reads as a geometry or collaboration mark more than a child-friendly family game.

Do not run a large image-generation batch yet. After Batch A:

1. Keep the polygon/relationship idea as the brand's core.
2. Develop three tightly bounded directions only:
   - a living polygon with a warm centre;
   - a polygon subtly containing a helping hand or heart;
   - a polygon with a restrained Dino footprint or protective presence.
3. Test each at 32 px, 64 px, and phone-home-screen size.
4. Choose one before generating character or marketing variations.

This can be done cheaply as code-native vector exploration. Image generation should be reserved for a final character-rich option after the symbol is approved.

## What Ayla Should Do Next

1. Keep testing the current version only with your own household and with supervision.
2. Do not invite friend households yet.
3. Start with Batch A, Increment 1: stop false success feedback.
4. Complete the six Batch A increments before visual rebranding.
5. Re-run a parent-child usability session after Batch B.

## What Martin Needs To Know

This codebase is architecturally usable. It should not be thrown away and rebuilt as a monolithic prototype. The strongest pieces to preserve are:

- the domain types and game rules;
- immutable points and contribution ledgers;
- database-level uniqueness and secure action functions;
- repository boundaries;
- household-scoped records;
- the central cooperation flow.

The immediate engineering focus should be transactional onboarding, server-confirmed interface feedback, child-safe snapshots, strict database write boundaries, complete child/reward workflows, and integration tests. Visual polishing should follow those repairs rather than replace them.

## Audit Limits

- The repository was inspected without editing live application code.
- Automated checks and the production build passed.
- A fresh controlled browser session was unavailable in the audit environment, so no new signed-in multi-phone or pixel-level visual test was claimed.
- Live Supabase grants should be verified directly during the database-boundary increment; migration files alone cannot prove the current remote permission state.
