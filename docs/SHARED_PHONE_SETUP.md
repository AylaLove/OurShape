# Shared Phone Setup Handoff

## What is ready

The repository now contains the complete data contract needed for the first three-person household:

- adult authentication through Supabase Auth;
- a household created by the first adult;
- a parent-managed child profile without an email account;
- a limited child-phone session claimed with a short-lived six-digit parent code;
- a one-use, expiring invitation for the second adult;
- household-isolated quest, gratitude, point, reward, and history records;
- one household snapshot shaped exactly like the tested game state;
- secure actions for joining, completing, endorsing, redeeming, high-fiving, and sending kudos;
- gratitude notes preserved with the verified endorsement;
- child snapshots that exclude adult-private rewards.

The original public route still uses resettable demo data. A separate `/shared/` route now
uses the real Supabase household records without pretending that every feature is connected.

## Completed infrastructure

- A dedicated `Our Shape Development` Supabase project has been created.
- All repository migrations have been applied in filename order.
- The 19 expected public tables are present.
- The public project URL and publishable key are stored in ignored local settings.
- The database password has been rotated and stored in the local Mac Keychain.

## Shared route now implemented

1. Adults open `/shared/` and request a password-free email sign-in link.
2. The first adult creates the household and a managed child profile.
3. The app seeds three starter household quests.
4. The first adult creates and copies a private invitation for the second adult.
5. The invited adult signs in with their own email and accepts the invitation.
6. Each adult can act as themselves. The parent can also switch into their directly managed
   child profile.
7. Joining, completing, sending thanks, requesting one finishing touch, adding quests,
   adding repairs, and redeeming rewards use the secure database actions.
8. The app reloads the authoritative household snapshot after every successful action.

The invitation is preserved through the email sign-in redirect and removed from the browser
address after acceptance.

## External setup still required

1. Add the local and production `/shared/` URLs to the Supabase Auth redirect allow-list.
2. Create the first real adult Auth account through the shared sign-in screen.
3. Test the first household, managed child, and second-adult invitation on two phones.
4. Enable Supabase anonymous sign-in for the separate child-device flow.
5. On the parent phone, use `create_child_device_code` for the child profile.
6. On the child phone, start an anonymous session and use `claim_child_device`.
7. Seed reviewed rewards and the complete household quest set.
8. Connect household identity editing and daily intentions/capacity to database actions.

## Required proof before calling it shared

- Both adults can sign in independently.
- The parent can act through the child profile.
- The child phone can act only as the claimed child profile.
- Revoking the child-device record removes access.
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
