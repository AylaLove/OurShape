create or replace function public.create_repair_mission(
  target_household uuid,
  target_member uuid,
  mission_title text,
  mission_instruction text
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  actor_member uuid;
  mission_id uuid;
begin
  select id into actor_member
  from public.household_members
  where household_id = target_household
    and user_id = auth.uid()
    and role = 'adult'
    and active;

  if actor_member is null then raise exception 'Adult household membership required'; end if;
  if not exists (
    select 1 from public.household_members
    where id = target_member and household_id = target_household and active
  ) then raise exception 'Target member unavailable'; end if;
  if nullif(trim(mission_title), '') is null or nullif(trim(mission_instruction), '') is null
    then raise exception 'Repair title and instruction are required'; end if;
  if exists (
    select 1 from public.daily_quests
    where household_id = target_household
      and repair_for_member_id = target_member
      and kind = 'repair'
      and state not in ('completed', 'cancelled')
  ) then raise exception 'This member already has an open Repair Mission'; end if;

  insert into public.daily_quests (
    household_id,
    title,
    instruction,
    spoken_instruction,
    kind,
    icon,
    effort,
    appreciation_value,
    contribution_value,
    state,
    due_date,
    urgency,
    repair_for_member_id,
    created_by
  )
  values (
    target_household,
    left(trim(mission_title), 80),
    left(trim(mission_instruction), 240),
    left(trim(mission_instruction), 240),
    'repair',
    'repair',
    'light',
    0,
    0,
    'needed',
    current_date,
    1,
    target_member,
    actor_member
  )
  returning id into mission_id;

  insert into public.audit_events (
    household_id,
    actor_member_id,
    event_type,
    entity_type,
    entity_id,
    payload
  )
  values (
    target_household,
    actor_member,
    'repair_created',
    'daily_quest',
    mission_id,
    jsonb_build_object('target_member_id', target_member)
  );

  return mission_id;
end;
$$;

create or replace function public.join_quest(target_quest uuid, target_member uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  quest_row public.daily_quests%rowtype;
  participant_id uuid;
begin
  select * into quest_row from public.daily_quests where id = target_quest for update;
  if quest_row.id is null or not public.is_household_member(quest_row.household_id) then raise exception 'Quest unavailable'; end if;
  if quest_row.state not in ('needed', 'active') then raise exception 'Quest is not open'; end if;
  if not public.can_act_as_member(target_member) then raise exception 'Cannot act as this member'; end if;
  if not exists (select 1 from public.household_members where id = target_member and household_id = quest_row.household_id and active)
    then raise exception 'Member unavailable'; end if;
  if quest_row.kind = 'repair' and quest_row.repair_for_member_id <> target_member
    then raise exception 'This Repair Mission belongs to another family member'; end if;
  insert into public.quest_participants (household_id, quest_id, member_id)
  values (quest_row.household_id, quest_row.id, target_member)
  on conflict (quest_id, member_id) do update set member_id = excluded.member_id
  returning id into participant_id;
  update public.daily_quests set state = 'active' where id = quest_row.id and state = 'needed';
  return participant_id;
end;
$$;

create or replace function public.complete_quest(target_quest uuid, target_member uuid, request_key text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  quest_row public.daily_quests%rowtype;
  completion_id uuid;
  participants uuid[];
begin
  select * into quest_row from public.daily_quests where id = target_quest for update;
  if quest_row.id is null or not public.is_household_member(quest_row.household_id) then raise exception 'Quest unavailable'; end if;
  if quest_row.state not in ('needed', 'active') then raise exception 'Quest cannot be completed now'; end if;
  if not public.can_act_as_member(target_member) then raise exception 'Cannot act as this member'; end if;
  if not exists (select 1 from public.household_members where id = target_member and household_id = quest_row.household_id and active)
    then raise exception 'Member unavailable'; end if;
  if quest_row.kind = 'repair' and quest_row.repair_for_member_id <> target_member
    then raise exception 'Only the named family member can complete this Repair Mission'; end if;
  insert into public.quest_participants (household_id, quest_id, member_id)
  values (quest_row.household_id, quest_row.id, target_member) on conflict (quest_id, member_id) do nothing;
  select array_agg(member_id order by joined_at) into participants from public.quest_participants where quest_id = quest_row.id;
  insert into public.completions (household_id, quest_id, marked_by_id, participant_ids, idempotency_key)
  values (quest_row.household_id, quest_row.id, target_member, participants, request_key)
  on conflict (household_id, idempotency_key) do update set idempotency_key = excluded.idempotency_key
  returning id into completion_id;
  update public.daily_quests set state = 'pending_endorsement' where id = quest_row.id;
  return completion_id;
end;
$$;

create or replace function public.redeem_reward(target_reward uuid, target_member uuid, request_key text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  reward_row public.rewards%rowtype;
  member_row public.household_members%rowtype;
  current_balance integer;
  redemption_id uuid;
begin
  select * into reward_row from public.rewards where id = target_reward and active for update;
  select * into member_row from public.household_members where id = target_member and active;
  if reward_row.id is null or member_row.id is null or reward_row.household_id <> member_row.household_id
    or not public.is_household_member(reward_row.household_id) then raise exception 'Reward unavailable'; end if;
  if not public.can_act_as_member(target_member) then raise exception 'Cannot act as this member'; end if;
  if reward_row.audience <> 'all' and reward_row.audience <> member_row.role::text then raise exception 'Reward not available to this profile'; end if;
  if exists (
    select 1 from public.daily_quests
    where household_id = reward_row.household_id
      and repair_for_member_id = target_member
      and kind = 'repair'
      and state not in ('completed', 'cancelled')
  ) then raise exception 'Finish the open Repair Mission before opening Treasure'; end if;
  select coalesce(sum(amount), 0) into current_balance from public.point_ledger_entries
  where household_id = reward_row.household_id and member_id = target_member;
  if current_balance < reward_row.cost then raise exception 'Insufficient points'; end if;
  insert into public.redemptions (household_id, reward_id, member_id, status, idempotency_key)
  values (reward_row.household_id, reward_row.id, target_member, case when reward_row.requires_consent then 'requested' else 'accepted' end, request_key)
  on conflict (household_id, idempotency_key) do update set idempotency_key = excluded.idempotency_key
  returning id into redemption_id;
  insert into public.point_ledger_entries (household_id, member_id, amount, reason, idempotency_key)
  values (reward_row.household_id, target_member, -reward_row.cost, 'reward_redeemed', 'redemption:' || redemption_id)
  on conflict (household_id, idempotency_key) do nothing;
  return redemption_id;
end;
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
    if quest_row.kind <> 'repair' then
      split_units := quest_row.contribution_value / cardinality(completion_row.participant_ids);
      foreach participant in array completion_row.participant_ids loop
        insert into public.point_ledger_entries (household_id, member_id, quest_id, amount, reason, idempotency_key)
        values (completion_row.household_id, participant, quest_row.id, quest_row.appreciation_value, 'quest_endorsed', 'completion:' || completion_row.id || ':points:' || participant);
        insert into public.contribution_records (household_id, member_id, quest_id, units, idempotency_key)
        values (completion_row.household_id, participant, quest_row.id, split_units, 'completion:' || completion_row.id || ':contribution:' || participant);
      end loop;
    end if;
  end if;

  insert into public.audit_events (household_id, actor_member_id, event_type, entity_type, entity_id)
  values (
    completion_row.household_id,
    target_endorser,
    case
      when quest_row.kind = 'repair' and target_response = 'thanked' then 'repair_completed'
      else target_response::text
    end,
    'completion',
    completion_row.id
  );
  return endorsement_id;
end;
$$;

drop policy if exists quests_access on public.daily_quests;
create policy quests_read on public.daily_quests
  for select using (public.is_household_member(household_id));
create policy quests_write on public.daily_quests
  for all using (public.is_household_adult(household_id))
  with check (public.is_household_adult(household_id));

alter function public.household_snapshot(uuid, uuid)
  rename to household_snapshot_without_repair_targets;

create or replace function public.household_snapshot(
  target_household uuid,
  target_member uuid
)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare
  result jsonb;
  repaired_quests jsonb;
begin
  result := public.household_snapshot_without_repair_targets(target_household, target_member);

  select coalesce(jsonb_agg(
    case
      when quest.repair_for_member_id is not null
        then jsonb_set(item.value, '{suggestedMemberIds}', jsonb_build_array(quest.repair_for_member_id), true)
      else item.value
    end
    order by item.ordinality
  ), '[]'::jsonb)
  into repaired_quests
  from jsonb_array_elements(result->'quests') with ordinality as item(value, ordinality)
  left join public.daily_quests quest on quest.id = (item.value->>'id')::uuid;

  return jsonb_set(result, '{quests}', repaired_quests, true);
end;
$$;

revoke all on function public.create_repair_mission(uuid, uuid, text, text) from public;
revoke all on function public.household_snapshot_without_repair_targets(uuid, uuid) from public;
revoke all on function public.household_snapshot_without_repair_targets(uuid, uuid) from authenticated;
revoke all on function public.household_snapshot(uuid, uuid) from public;
grant execute on function public.create_repair_mission(uuid, uuid, text, text) to authenticated;
grant execute on function public.household_snapshot(uuid, uuid) to authenticated;
