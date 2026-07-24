# Next Batch: Real Household Persistence

## Objective

Move the tested game loop from resettable demo memory into one private household that works
across three phones:

`Sage helps -> adult sees it -> adult sends thanks -> every phone sees the same result`

The child-first Home, quest action scene, dinosaur state, Home Energy, endorsement rules,
points, rewards, and adult detail views are already sufficient for this proof. Do not add
another game system before the household truth is persistent.

## Work

1. Connect one development Supabase project using protected environment variables.
2. Run the prepared Postgres migrations and verify row-level security.
3. Replace the in-memory demo repository at the app boundary with
   `SupabaseGameRepository`.
4. Create one household, two adult accounts, and one parent-managed child profile.
5. Claim one child device through the existing short-lived parent code.
6. Subscribe each phone to household changes or refresh the shared snapshot safely.
7. Prove the complete join-to-thanks loop across separate devices.
8. Verify refresh, weak connection, simultaneous actions, duplicate endorsement, and reward
   spending.
9. Add a clear offline/error state; never silently pretend an unsaved action succeeded.
10. Prepare a private preview URL for the household beta.

## Preserve

- Another-person endorsement before points or Home Energy.
- Immutable point and contribution ledgers.
- Full appreciation points for every participant in a shared quest.
- Child-safe screens without adult balance or private rewards.
- Household scoping on every owned record.
- The repository boundary; UI components must not call Supabase directly.
- The current visual experience unless a real phone test reveals a usability problem.

## External Inputs Needed

- A Supabase development project.
- Its public project URL and publishable/anonymous key in local environment settings.
- A private preview host for phone access.

Never paste service-role keys, database passwords, or other secrets into chat, source files,
screenshots, or Git.

## Acceptance

The batch is complete only when:

- Sage joins and finishes a quest on the child phone;
- a non-participating adult sees the pending effort on another phone;
- the adult sends thanks once;
- all three phones show the same completed quest, Home Energy, points, and history;
- reloading any phone keeps the result;
- repeating the endorsement cannot award points twice;
- a second household cannot read or infer the first household's data.

## Cost Boundary

No image generation is needed. The work is medium-high engineering effort because
authentication, database policy, and multi-device testing must be exact. It should be
completed before discoveries, customization, streaks, notifications, or friend households.
