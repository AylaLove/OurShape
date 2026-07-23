# Shared Phone Setup Handoff

## What is ready

The repository now contains the complete data contract needed for the first three-person household:

- adult authentication through Supabase Auth;
- a household created by the first adult;
- a parent-managed child profile without an email account;
- a one-use, expiring invitation for the second adult;
- household-isolated quest, gratitude, point, reward, and history records;
- one household snapshot shaped exactly like the tested game state;
- secure actions for joining, completing, endorsing, redeeming, high-fiving, and sending kudos;
- gratitude notes preserved with the verified endorsement;
- child snapshots that exclude adult-private rewards.

The current interface is still intentionally using resettable demo data. No fake connection is claimed.

## External setup still required

1. Create a new Supabase development project specifically for this app.
2. Apply all migrations in `supabase/migrations` in filename order.
3. Put the project URL and publishable key in `.env.local`.
4. Create the first adult Auth account.
5. Use `create_household_with_owner` to create the home and owner membership.
6. Use `add_managed_child` to create the child profile.
7. Use `create_household_invite` to produce a short-lived invitation for the second adult.
8. Sign in as the second adult and use `accept_household_invite`.
9. Seed the reviewed household quest templates and rewards.
10. Switch the interface from demo repository to `SupabaseGameRepository`.

## Required proof before calling it shared

- Both adults can sign in independently.
- The parent can act through the child profile.
- The second adult cannot read another household.
- A quest joined on one phone appears on the other after refresh.
- A completion can only be endorsed by a non-participant.
- Repeating an endorsement cannot award points twice.
- A gratitude phrase appears in household history.
- Adult-private rewards are absent when the child profile is active.
- All three profiles see the same Home Energy total.

## Deliberate exclusions

- Do not reuse The Hearth or Zamkee credentials.
- Do not use browser storage as household truth.
- Do not place the service-role key in browser code.
- Do not enable realtime subscriptions until the snapshot and secure actions pass the two-phone refresh test.
- Do not invite friend households until row-level isolation has been tested with two separate households.

