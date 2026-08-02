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
const childDevices = await readFile(
  new URL("../supabase/migrations/202607230003_child_device_access.sql", import.meta.url),
  "utf8",
);
const repairSchema = await readFile(
  new URL("../supabase/migrations/202607240001_repair_mission_schema.sql", import.meta.url),
  "utf8",
);
const repairTarget = await readFile(
  new URL("../supabase/migrations/202607240002_repair_mission_target.sql", import.meta.url),
  "utf8",
);
const repairActions = await readFile(
  new URL("../supabase/migrations/202607240003_repair_mission_actions.sql", import.meta.url),
  "utf8",
);
const questMetadata = await readFile(
  new URL("../supabase/migrations/202607290001_quest_scope_categories_energy.sql", import.meta.url),
  "utf8",
);
const membershipAccess = await readFile(
  new URL("../supabase/migrations/202608020001_authenticated_membership_read.sql", import.meta.url),
  "utf8",
);
const allSql = [core, actions, snapshot, invites, childDevices, repairSchema, repairTarget, repairActions, questMetadata, membershipAccess].join("\n");

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
  "child_device_access",
  "quest_categories",
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
  "create_child_device_code",
  "claim_child_device",
  "revoke_child_device",
  "create_repair_mission",
  "create_daily_quest",
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

if (!childDevices.includes("access.claimed_by = auth.uid()")) {
  failures.push("Child-device membership is not tied to the authenticated device.");
}

if (!childDevices.includes("Adult accounts cannot become child devices")) {
  failures.push("Adult accounts are not protected from child-device claiming.");
}

if (!childDevices.includes("access.revoked_at is null")) {
  failures.push("Revoked child devices retain access.");
}

if (!repairActions.includes("Finish the open Repair Mission before opening Treasure")) {
  failures.push("Repair Missions do not lock reward redemption.");
}

if (!repairActions.includes("if quest_row.kind <> 'repair' then")) {
  failures.push("Repair Mission completion can create appreciation or contribution credit.");
}

for (const field of ["scope", "category_id", "home_energy_value", "suggested_member_ids"]) {
  if (!questMetadata.includes(`add column ${field}`)) {
    failures.push(`Daily quest metadata is missing: ${field}`);
  }
}

if (!questMetadata.includes("Personal tasks need a family member")) {
  failures.push("Personal task ownership is not validated.");
}

if (!questMetadata.includes("'{questCategories}'")) {
  failures.push("Household snapshots do not include custom task categories.");
}

if (!membershipAccess.includes("grant select on table public.household_members to authenticated")) {
  failures.push("Authenticated users cannot discover their RLS-scoped household membership.");
}

if (/\bgrant\s+(insert|update|delete|all)\b[^;]*\bhousehold_members\b/i.test(membershipAccess)) {
  failures.push("The membership discovery migration grants unsafe write access.");
}

if (failures.length) {
  console.error("Schema contract check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Schema contract check passed for ${requiredTables.length} tables and ${requiredFunctions.length} secure actions.`);
