# Architecture Guardrails

## Direction

The application is a responsive Progressive Web App built with Next.js and TypeScript. Supabase will provide managed authentication and Postgres persistence. The browser interface displays and requests state; it does not become the authoritative database.

The architecture is organised around product capabilities rather than one growing page:

- `households`: membership, roles, child profiles, household settings;
- `quests`: templates, daily instances, participation, completion;
- `geometry`: polygon placement and contribution presentation;
- `gratitude`: acknowledgement, high fives, kind correction;
- `rewards`: appreciation ledger and redemption;
- `domain`: shared business types and invariants.

## Non-negotiable rules

1. Private records always carry `household_id` and are protected by database row-level security.
2. Learner-style global profile state is not permitted. Active identity comes from the authenticated household session.
3. `localStorage` may cache disposable interface preferences only. It may not be the source of truth for quests, points, people, endorsements, or history.
4. Secrets live in environment variables. The Supabase service-role key is server-only and is never exposed through `NEXT_PUBLIC_*`.
5. Routes compose features. They do not contain the entire product's business logic.
6. Business rules live in typed domain functions and are tested independently from the interface.
7. Demonstration data is labelled and isolated so it cannot quietly become production truth.
8. Database changes use reviewed, reversible migrations.
9. Events that affect points or history must be idempotent and auditable.
10. The product must pass household-isolation, child-privacy, duplicate-reward, and multi-phone tests before beta.

## File-size warning line

Source files over 400 lines trigger an architecture warning. A large file is not automatically wrong, but it requires a deliberate review before more behaviour is added.

## Data ownership

The planned primary entities are:

- Household
- Membership
- ChildProfile
- HouseholdSettings
- QuestTemplate
- DailyQuest
- QuestParticipant
- Completion
- Endorsement
- PointLedgerEntry
- ContributionRecord
- ContributionTarget
- Reward
- Redemption
- HighFive
- Kudos
- SharedTemplatePack

The database will enforce identity, household membership, uniqueness, and ledger safety. The UI must not rely on hidden buttons or client-only checks for security.

## Deployment approach

The first deployment target should provide:

- automatic preview deployments from Git branches;
- protected environment variables;
- a separate Supabase development project;
- repeatable migrations;
- build and type checks before merge.

The exact host will be selected with Martin before production. The application must not depend on Emanuel's existing Hearth hosting or API.

