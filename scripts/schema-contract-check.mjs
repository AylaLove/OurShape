import { readFile } from "node:fs/promises";

const core = await readFile(
  new URL("../supabase/migrations/202607220001_household_game_core.sql", import.meta.url),
  "utf8",
);
const actions = await readFile(
  new URL("../supabase/migrations/202607220002_secure_actions.sql", import.meta.url),
  "utf8",
);
const snapshot = await readFile(
  new URL("../supabase/migrations/202607230001_household_snapshot.sql", import.meta.url),
  "utf8",
);
const invites = await readFile(
  new URL("../supabase/migrations/202607230002_household_invites.sql", import.meta.url),
  "utf8",
);
const allSql = [core, actions, snapshot, invites].join("\n");

const requiredTables = [
  "households",
  "household_members",
  "household_settings",
  "contribution_targets",
  "quest_templates",
  "daily_quests",
  "quest_participants",
  "completions",
  "endorsements",
  "point_ledger_entries",
  "contribution_records",
  "rewards",
  "redemptions",
  "high_fives",
  "kudos",
  "audit_events",
  "household_invites",
];

const requiredFunctions = [
  "create_household_with_owner",
  "add_managed_child",
  "join_quest",
  "complete_quest",
  "endorse_completion",
  "redeem_reward",
  "send_high_five",
  "send_kudos",
  "endorse_completion_with_note",
  "household_snapshot",
  "create_household_invite",
  "accept_household_invite",
];

const failures = [];

for (const table of requiredTables) {
  if (!allSql.includes(`create table public.${table}`)) {
    failures.push(`Missing table: ${table}`);
  }
  if (!allSql.includes(`alter table public.${table} enable row level security`)) {
    failures.push(`Row-level security is not enabled for: ${table}`);
  }
}

for (const functionName of requiredFunctions) {
  if (!allSql.includes(`function public.${functionName}`)) {
    failures.push(`Missing secure action: ${functionName}`);
  }
}

for (const protectedTable of [
  "completions",
  "endorsements",
  "point_ledger_entries",
  "contribution_records",
  "redemptions",
]) {
  if (!actions.includes(`revoke insert, update, delete on public.${protectedTable}`)) {
    failures.push(`Direct writes were not revoked for: ${protectedTable}`);
  }
}

if (!core.includes("Participants cannot endorse their own completion")) {
  failures.push("Self-endorsement protection is missing.");
}

if (!core.includes("unique (completion_id)")) {
  failures.push("Duplicate endorsement protection is missing.");
}

if (!core.includes("function public.can_act_as_member")) {
  failures.push("Parent-managed profile authorization is missing.");
}

if (!snapshot.includes("not reward.private_to_adults or member_role = 'adult'")) {
  failures.push("Child snapshot filtering for adult-private rewards is missing.");
}

if (!snapshot.includes("set note = nullif(left(trim(target_note), 120), '')")) {
  failures.push("Gratitude notes are not preserved by the secure endorsement action.");
}

if (!invites.includes("token_hash = digest(invite_token, 'sha256')")) {
  failures.push("Household invitations are not stored and compared as secure hashes.");
}

if (!invites.includes("or invite_row.expires_at <= now()")) {
  failures.push("Expired household invitations are not rejected.");
}

if (failures.length) {
  console.error("Schema contract check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Schema contract check passed for ${requiredTables.length} tables and ${requiredFunctions.length} secure actions.`);
