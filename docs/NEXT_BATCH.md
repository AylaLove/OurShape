# Next Batch: Real Household Connection

## Objective

Connect the now-playable household loop to a dedicated Supabase development project and prove it across the three phones.

## Work

1. Create a development Supabase project and apply the existing migrations.
2. Add adult sign-in and use `create_household_with_owner` for first-time setup.
3. Add the second adult and parent-managed child profile.
4. Implement the Supabase `GameRepository` adapter and realtime refresh.
5. Review the Flatastic import sheet, then seed only approved templates.
6. Add offline action queue status without using browser storage as truth.
7. Prove two households cannot read or change each other's data.
8. Deploy a private preview and test it on all three phones.

## Stop conditions

Do not call this a household beta until:

- identity survives refresh;
- the active household is unambiguous;
- child and adult responses expose different fields;
- cross-household isolation tests pass;
- no private state depends on local storage.
