# Next Batch: Identity and Household Data

## Objective

Replace demonstration identity with the smallest trustworthy shared household foundation.

## Work

1. Install and lock dependencies.
2. Create a development Supabase project.
3. Add adult authentication.
4. Add a parent-managed child profile with no child email requirement.
5. Create the first migrations for households, memberships, child profiles, and household settings.
6. Add row-level security policies.
7. Prove two households cannot read or change each other's data.
8. Add a seed path for the three-person test household.
9. Deploy a private preview and test it on two phones.

## Stop conditions

Do not start the quest engine until:

- identity survives refresh;
- the active household is unambiguous;
- child and adult responses expose different fields;
- cross-household isolation tests pass;
- no private state depends on local storage.

