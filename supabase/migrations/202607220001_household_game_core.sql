create extension if not exists pgcrypto;

create type public.household_role as enum ('adult', 'child');
create type public.quest_state as enum ('needed', 'active', 'pending_endorsement', 'completed', 'carried', 'rescheduled', 'cancelled');
create type public.quest_kind as enum ('personal', 'open', 'duo', 'family', 'care', 'surprise_help', 'big', 'rescue');
create type public.endorsement_response as enum ('thanked', 'needs_a_little_more');

create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  timezone text not null default 'UTC',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  parent_member_id uuid references public.household_members(id) on delete restrict,
  display_name text not null check (char_length(display_name) between 1 and 40),
  initials text not null check (char_length(initials) between 1 and 3),
  role public.household_role not null,
  colour text not null default '#163a31',
  point_label text not null default 'Chill Points',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint adult_has_login check ((role = 'adult' and user_id is not null) or role = 'child'),
  constraint child_is_managed check ((role = 'child' and parent_member_id is not null and user_id is null) or role = 'adult'),
  unique (household_id, user_id)
);

create table public.household_settings (
  household_id uuid primary key references public.households(id) on delete cascade,
  quiet_hours_start time not null default '20:00',
  quiet_hours_end time not null default '07:00',
  acknowledgement_required boolean not null default true,
  updated_by uuid not null references public.household_members(id),
  updated_at timestamptz not null default now()
);

create table public.contribution_targets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete cascade,
  weekly_target numeric(8,2) not null check (weekly_target >= 0),
  reason text,
  valid_from date not null,
  valid_until date,
  changed_by uuid not null references public.household_members(id),
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_until >= valid_from)
);

create table public.quest_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  instruction text not null default '',
  spoken_instruction text not null default '',
  kind public.quest_kind not null,
  icon text not null default 'home',
  effort text not null check (effort in ('light', 'medium', 'substantial', 'major')),
  appreciation_value integer not null check (appreciation_value between 0 and 100),
  contribution_value numeric(8,2) not null check (contribution_value >= 0),
  recurrence jsonb not null default '{"type":"when_needed"}'::jsonb,
  active boolean not null default true,
  created_by uuid not null references public.household_members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_quests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  template_id uuid references public.quest_templates(id) on delete set null,
  title text not null,
  instruction text not null default '',
  spoken_instruction text not null default '',
  kind public.quest_kind not null,
  icon text not null default 'home',
  effort text not null check (effort in ('light', 'medium', 'substantial', 'major')),
  appreciation_value integer not null check (appreciation_value between 0 and 100),
  contribution_value numeric(8,2) not null check (contribution_value >= 0),
  state public.quest_state not null default 'needed',
  due_date date not null,
  urgency smallint not null default 0 check (urgency between 0 and 2),
  completed_at timestamptz,
  created_by uuid not null references public.household_members(id),
  created_at timestamptz not null default now()
);

create table public.quest_participants (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  quest_id uuid not null references public.daily_quests(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (quest_id, member_id)
);

create table public.completions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  quest_id uuid not null references public.daily_quests(id) on delete restrict,
  marked_by_id uuid not null references public.household_members(id),
  participant_ids uuid[] not null check (cardinality(participant_ids) > 0),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (household_id, idempotency_key)
);

create table public.endorsements (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  quest_id uuid not null references public.daily_quests(id) on delete restrict,
  completion_id uuid not null references public.completions(id) on delete restrict,
  endorser_id uuid not null references public.household_members(id),
  response public.endorsement_response not null,
  note text,
  created_at timestamptz not null default now(),
  unique (completion_id)
);

create table public.point_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete restrict,
  quest_id uuid references public.daily_quests(id) on delete restrict,
  amount integer not null,
  reason text not null check (reason in ('quest_endorsed', 'kindness', 'reward_redeemed', 'correction')),
  idempotency_key text not null,
  reverses_entry_id uuid references public.point_ledger_entries(id),
  created_at timestamptz not null default now(),
  unique (household_id, idempotency_key)
);

create table public.contribution_records (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  member_id uuid not null references public.household_members(id) on delete restrict,
  quest_id uuid not null references public.daily_quests(id) on delete restrict,
  units numeric(8,2) not null,
  idempotency_key text not null,
  reverses_entry_id uuid references public.contribution_records(id),
  created_at timestamptz not null default now(),
  unique (household_id, idempotency_key)
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  icon text not null,
  cost integer not null check (cost > 0),
  audience text not null check (audience in ('child', 'adult', 'all')),
  requires_consent boolean not null default true,
  private_to_adults boolean not null default false,
  active boolean not null default true,
  created_by uuid not null references public.household_members(id),
  created_at timestamptz not null default now(),
  check (not (audience = 'child' and private_to_adults))
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete restrict,
  member_id uuid not null references public.household_members(id) on delete restrict,
  status text not null check (status in ('requested', 'accepted', 'declined', 'fulfilled')),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (household_id, idempotency_key)
);

create table public.high_fives (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  from_member_id uuid not null references public.household_members(id),
  to_member_id uuid not null references public.household_members(id),
  quest_id uuid references public.daily_quests(id),
  created_at timestamptz not null default now(),
  check (from_member_id <> to_member_id)
);

create table public.kudos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  from_member_id uuid not null references public.household_members(id),
  to_member_id uuid not null references public.household_members(id),
  message text not null check (char_length(message) between 1 and 240),
  created_at timestamptz not null default now(),
  check (from_member_id <> to_member_id)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  actor_member_id uuid references public.household_members(id),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_household_member(target_household uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.household_members where household_id = target_household and user_id = auth.uid() and active); $$;

create or replace function public.is_household_adult(target_household uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.household_members where household_id = target_household and user_id = auth.uid() and active and role = 'adult'); $$;

create or replace function public.can_act_as_member(target_member uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.household_members member
    left join public.household_members parent on parent.id = member.parent_member_id
    where member.id = target_member
      and member.active
      and (
        member.user_id = auth.uid()
        or (member.role = 'child' and parent.user_id = auth.uid() and parent.active)
      )
  );
$$;

create or replace function public.endorse_completion(target_completion uuid, target_endorser uuid, target_response public.endorsement_response)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  completion_row public.completions%rowtype;
  quest_row public.daily_quests%rowtype;
  endorsement_id uuid;
  participant uuid;
  split_units numeric(8,2);
begin
  select * into completion_row from public.completions where id = target_completion for update;
  if completion_row.id is null or not public.is_household_member(completion_row.household_id) then raise exception 'Completion unavailable'; end if;
  if not public.can_act_as_member(target_endorser) then raise exception 'Cannot act as this endorser'; end if;
  if target_endorser = any(completion_row.participant_ids) then raise exception 'Participants cannot endorse their own completion'; end if;
  if not exists (select 1 from public.household_members where id = target_endorser and household_id = completion_row.household_id and active)
    then raise exception 'Endorser is not an active household member'; end if;

  select * into quest_row from public.daily_quests where id = completion_row.quest_id for update;
  insert into public.endorsements (household_id, quest_id, completion_id, endorser_id, response)
  values (completion_row.household_id, completion_row.quest_id, completion_row.id, target_endorser, target_response)
  returning id into endorsement_id;

  if target_response = 'needs_a_little_more' then
    update public.daily_quests set state = 'active' where id = quest_row.id;
  else
    update public.daily_quests set state = 'completed', completed_at = now() where id = quest_row.id;
    split_units := quest_row.contribution_value / cardinality(completion_row.participant_ids);
    foreach participant in array completion_row.participant_ids loop
      insert into public.point_ledger_entries (household_id, member_id, quest_id, amount, reason, idempotency_key)
      values (completion_row.household_id, participant, quest_row.id, quest_row.appreciation_value, 'quest_endorsed', 'completion:' || completion_row.id || ':points:' || participant);
      insert into public.contribution_records (household_id, member_id, quest_id, units, idempotency_key)
      values (completion_row.household_id, participant, quest_row.id, split_units, 'completion:' || completion_row.id || ':contribution:' || participant);
    end loop;
  end if;
  insert into public.audit_events (household_id, actor_member_id, event_type, entity_type, entity_id)
  values (completion_row.household_id, target_endorser, target_response::text, 'completion', completion_row.id);
  return endorsement_id;
end;
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_settings enable row level security;
alter table public.contribution_targets enable row level security;
alter table public.quest_templates enable row level security;
alter table public.daily_quests enable row level security;
alter table public.quest_participants enable row level security;
alter table public.completions enable row level security;
alter table public.endorsements enable row level security;
alter table public.point_ledger_entries enable row level security;
alter table public.contribution_records enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;
alter table public.high_fives enable row level security;
alter table public.kudos enable row level security;
alter table public.audit_events enable row level security;

create policy households_read on public.households for select using (public.is_household_member(id));
create policy households_create on public.households for insert with check (created_by = auth.uid());
create policy members_read on public.household_members for select using (public.is_household_member(household_id));
create policy settings_read on public.household_settings for select using (public.is_household_member(household_id));
create policy settings_write on public.household_settings for all using (public.is_household_adult(household_id)) with check (public.is_household_adult(household_id));
create policy targets_read on public.contribution_targets for select using (public.is_household_member(household_id));
create policy targets_write on public.contribution_targets for all using (public.is_household_adult(household_id)) with check (public.is_household_adult(household_id));
create policy templates_read on public.quest_templates for select using (public.is_household_member(household_id));
create policy templates_write on public.quest_templates for all using (public.is_household_adult(household_id)) with check (public.is_household_adult(household_id));
create policy quests_access on public.daily_quests for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy participants_access on public.quest_participants for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy completions_read on public.completions for select using (public.is_household_member(household_id));
create policy completions_create on public.completions for insert with check (public.is_household_member(household_id));
create policy endorsements_read on public.endorsements for select using (public.is_household_member(household_id));
create policy points_read on public.point_ledger_entries for select using (public.is_household_member(household_id));
create policy contribution_read on public.contribution_records for select using (public.is_household_member(household_id));
create policy rewards_read on public.rewards for select using (public.is_household_member(household_id) and (not private_to_adults or public.is_household_adult(household_id)));
create policy rewards_write on public.rewards for all using (public.is_household_adult(household_id)) with check (public.is_household_adult(household_id));
create policy redemptions_read on public.redemptions for select using (public.is_household_member(household_id));
create policy redemptions_create on public.redemptions for insert with check (public.is_household_member(household_id));
create policy high_fives_access on public.high_fives for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy kudos_access on public.kudos for all using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy audit_read on public.audit_events for select using (public.is_household_adult(household_id));

revoke update, delete on public.point_ledger_entries from authenticated;
revoke update, delete on public.contribution_records from authenticated;
revoke update, delete on public.endorsements from authenticated;
grant execute on function public.endorse_completion(uuid, uuid, public.endorsement_response) to authenticated;

create index daily_quests_household_due_idx on public.daily_quests (household_id, due_date, state);
create index point_ledger_member_idx on public.point_ledger_entries (household_id, member_id, created_at desc);
create index contribution_member_idx on public.contribution_records (household_id, member_id, created_at desc);
create index audit_household_idx on public.audit_events (household_id, created_at desc);
