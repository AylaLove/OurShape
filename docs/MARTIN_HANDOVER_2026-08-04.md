# Our Shape Developer Handover

**Prepared:** 4 August 2026  
**Repository:** `https://github.com/AylaLove/OurShape`  
**Authoritative branch:** `main`  
**Handover checkpoint:** `0df17aa` (`Protect child household snapshots`)

## Purpose

Our Shape is a mobile-first family participation game. Its central loop is:

`Needs doing -> Join -> Do -> Waiting for thanks -> Endorsed -> Gratitude + High Fives + Home Energy + History`

The product is intended to help adults and a young child notice what the household needs,
participate alone or together, acknowledge effort, and preserve an honest history. It must
not become a ranking, punishment, or shame system.

## Current Technical Shape

- Next.js 16 and TypeScript Progressive Web App.
- Modular interface under `apps/web`.
- Shared game rules and types under `packages/domain`.
- Supabase Auth and Postgres for the shared household route.
- Reviewed SQL migrations under `supabase/migrations`.
- Secure database functions for state-changing household actions.
- Immutable point and contribution ledgers.
- Resettable demo route at `/` and database-backed route at `/shared/`.
- Public preview currently hosted through OpenAI Sites.

This repository was intentionally created separately from The Hearth simulator and does not
depend on the old Hearth API or MySQL database.

## Working Product Slice

- Password-free adult email sign-in.
- First household creation with a parent-managed child profile.
- Invitation flow for a second adult.
- Household-scoped profile switching.
- Joining, completing, and acknowledging quests.
- Protection against self-endorsement and duplicate awards.
- Personal High Fives, collective Home Energy, gratitude, and history.
- Custom one-off home and personal quests.
- Repair Missions that preserve earned points and temporarily pause Treasure.
- Child-focused `How can I help?` recommendations.
- Mobile-first Home, Quests, Thanks, Treasure, and profile views.
- PWA manifest, service worker, and installable icons.

## Latest Hardening Work

The following high-priority defects from the 3 August readiness audit have now been addressed:

1. Live actions report success or failure explicitly, so the interface does not celebrate a
   failed database action.
2. Initial household setup is performed through an atomic database operation rather than a
   fragile sequence of unrelated browser writes.
3. Secure random-token functions use a verified extension path.
4. Authenticated membership discovery is granted without granting membership writes.
5. Email sign-in handles cross-browser redirects and clearer rate-limit/auth errors.
6. Child household snapshots are filtered at the database boundary. Child responses exclude
   adult contribution ledgers and targets, and authenticated users cannot call the underlying
   adult snapshot function directly.

The child snapshot migration was applied to the live development database and verified with
read-only permission checks before this handover.

## Verification At Handover

At commit `0df17aa`:

- TypeScript check passes.
- 54 automated tests across 15 files pass.
- Schema contract check passes for 19 tables and 18 secure actions.
- Project architecture/health check passes.
- Production Sites build succeeds.
- Git working tree is clean and synchronized with `origin/main`.
- No tracked `.env`, credentials, secrets, or service-account files were found.

Run the same checkpoint locally with:

```bash
pnpm install
pnpm check
pnpm build:sites
```

## Remaining Risks And Recommended Order

### 1. Verify the database write boundary

Inspect live table grants and row-level policies. Normal application writes should go through
the secure action functions, not direct table updates that could bypass game rules or history.

### 2. Add real Supabase security integration tests

Create two isolated test households, two adults, and one child profile. Prove that:

- one household cannot read or change another;
- a child cannot retrieve adult-private contribution or reward data;
- duplicate or simultaneous actions cannot award twice;
- direct writes cannot bypass secure actions.

### 3. Complete the real child-device path

Database functions for short-lived child-device access exist, but the parent-facing setup,
claim, revocation, and real-phone proof are incomplete.

### 4. Prove the three-phone household loop

Test Ayla, Raen, and Sage across separate devices from join through acknowledgement. Current
shared state refreshes after actions, but realtime cross-device updates and a deliberate
offline strategy are not complete.

### 5. Finish product administration

The live application still needs complete editing for recurring quests, schedules, categories,
rewards, members, household identity, contribution targets, and daily capacity/intentions.

### 6. Complete reward consent and fulfilment

Define and implement accept, decline, fulfil, cancel, and refund behaviour, especially for
person-provided rewards. Adult-only rewards must remain private and consensual.

### 7. Reduce maintenance debt gradually

- Remove accidentally tracked generated output folders after confirming they are not inputs.
- Split large CSS files by feature as screens are touched.
- Standardize dialogs with focus trapping, Escape handling, and focus restoration.
- Update older status documents after technical milestones so they do not contradict reality.

## Deployment And External Services

- **Source control:** GitHub repository above.
- **Database/Auth:** Supabase project named `Our Shape Development`.
- **Email delivery:** Supabase custom SMTP configured through Resend.
- **Email domain:** `auth.thehearth.pro` is used for authentication email configuration.
- **Public preview:** `https://our-shape-family-game.grumpyhustles.chatgpt.site/`
- **Shared route:** `https://our-shape-family-game.grumpyhustles.chatgpt.site/shared/`

The public preview may not always correspond to the newest Git commit. Confirm the deployed
build/version before using it as architectural evidence. GitHub `main` at the checkpoint above
is the source of truth for this handover.

## Access Martin Needs

Give access through individual accounts and invitations. Do not send shared passwords.

Required:

1. GitHub collaborator access to `AylaLove/OurShape`.
2. Supabase project access to `Our Shape Development`, preferably the least-privileged role
   that still permits architecture, Auth, SQL migration, RLS, and logs review.
3. The public preview and `/shared/` URLs for product testing.

Only if he is auditing deployment or email delivery:

4. OpenAI Sites project/deployment access or a deployment export/history.
5. Resend team access for SMTP logs and domain status.
6. DNS access for `thehearth.pro`, ideally temporary/delegated rather than shared hosting
   credentials.

Do not provide database passwords, Supabase service-role keys, SMTP/API keys, Plesk passwords,
or personal email passwords by email. Rotate any credential previously exposed in a message or
screenshot before relying on it.

## Useful Documents

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/PRODUCT_CONTRACT.md`
- `docs/OUR_SHAPE_READINESS_AUDIT_2026-08-03.md`
- `docs/SHARED_PHONE_SETUP.md`
- `docs/HOUSEHOLD_BETA_CHECKLIST.md`
- `supabase/README.md`

The readiness audit is valuable historical context, but this dated handover records the fixes
completed after that audit and should be read first.

## Requested Review From Martin

Please review:

1. Whether the current Next.js/domain/repository/Supabase separation is suitable for continued
   development.
2. Whether migrations, grants, RLS policies, and secure functions provide a trustworthy
   household boundary.
3. Whether the deployment and environment-variable strategy is appropriate.
4. The smallest safe path from household alpha to a three-phone private beta.
5. Which changes are essential now versus improvements that should wait until real household
   testing produces evidence.

Please preserve the working product model and avoid a broad rewrite unless a specific technical
risk justifies it.
