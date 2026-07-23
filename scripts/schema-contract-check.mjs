import { readFile } from "node:fs/promises";

const core = await readFile(
  new URL("../supabase/migrations/202607220001_household_game_core.sql", import.meta.url),
  "utf8",
);
const actions = await readFile(
  new URL("../supabase/migrations/202607220002_secure_actions.sql", import.meta.url),
  "utf8",
);

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
];

const failures = [];

for (const table of requiredTables) {
  if (!core.includes(`create table public.${table}`)) {
    failures.push(`Missing table: ${table}`);
  }
  if (!core.includes(`alter table public.${table} enable row level security`)) {
    failures.push(`Row-level security is not enabled for: ${table}`);
  }
}

for (const functionName of requiredFunctions) {
  const sql = functionName === "endorse_completion" ? core : actions;
  if (!sql.includes(`function public.${functionName}`)) {
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

if (failures.length) {
  console.error("Schema contract check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Schema contract check passed for ${requiredTables.length} tables and ${requiredFunctions.length} secure actions.`);
