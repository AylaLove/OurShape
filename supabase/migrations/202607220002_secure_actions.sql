create or replace function public.create_household_with_owner(
  home_name text,
  home_timezone text,
  owner_name text,
  owner_initials text,
  owner_colour text default '#ef6d5b'
)
returns table (household_id uuid, member_id uuid)
language plpgsql security definer set search_path = public
as $$
declare
  new_household uuid;
  new_member uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.households (name, timezone, created_by)
  values (home_name, home_timezone, auth.uid()) returning id into new_household;
  insert into public.household_members (household_id, user_id, display_name, initials, role, colour, point_label)
  values (new_household, auth.uid(), owner_name, owner_initials, 'adult', owner_colour, 'Chill Points') returning id into new_member;
  insert into public.household_settings (household_id, updated_by) values (new_household, new_member);
  return query select new_household, new_member;
end;
$$;

create or replace function public.add_managed_child(
  target_household uuid,
  child_name text,
  child_initials text,
  child_colour text default '#e2aa37'
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  parent_member uuid;
  new_child uuid;
begin
  select id into parent_member from public.household_members
  where household_id = target_household and user_id = auth.uid() and active and role = 'adult';
  if parent_member is null then raise exception 'Adult household membership required'; end if;
  insert into public.household_members (household_id, parent_member_id, display_name, initials, role, colour, point_label)
  values (target_household, parent_member, child_name, child_initials, 'child', child_colour, 'Watch Points') returning id into new_child;
  return new_child;
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

create or replace function public.send_high_five(target_from uuid, target_to uuid, target_quest uuid default null)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  from_member public.household_members%rowtype;
  high_five_id uuid;
begin
  select * into from_member from public.household_members where id = target_from and active;
  if from_member.id is null or not public.can_act_as_member(target_from) then raise exception 'Cannot act as this member'; end if;
  if target_from = target_to then raise exception 'Choose another household member'; end if;
  if not exists (select 1 from public.household_members where id = target_to and household_id = from_member.household_id and active)
    then raise exception 'Recipient unavailable'; end if;
  if target_quest is not null and not exists (select 1 from public.daily_quests where id = target_quest and household_id = from_member.household_id)
    then raise exception 'Quest unavailable'; end if;
  insert into public.high_fives (household_id, from_member_id, to_member_id, quest_id)
  values (from_member.household_id, target_from, target_to, target_quest)
  returning id into high_five_id;
  return high_five_id;
end;
$$;

create or replace function public.send_kudos(target_from uuid, target_to uuid, target_message text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  from_member public.household_members%rowtype;
  kudos_id uuid;
begin
  select * into from_member from public.household_members where id = target_from and active;
  if from_member.id is null or not public.can_act_as_member(target_from) then raise exception 'Cannot act as this member'; end if;
  if target_from = target_to then raise exception 'Choose another household member'; end if;
  if not exists (select 1 from public.household_members where id = target_to and household_id = from_member.household_id and active)
    then raise exception 'Recipient unavailable'; end if;
  insert into public.kudos (household_id, from_member_id, to_member_id, message)
  values (from_member.household_id, target_from, target_to, target_message)
  returning id into kudos_id;
  return kudos_id;
end;
$$;

revoke insert, update, delete on public.quest_participants from authenticated;
revoke insert, update, delete on public.completions from authenticated;
revoke insert, update, delete on public.endorsements from authenticated;
revoke insert, update, delete on public.point_ledger_entries from authenticated;
revoke insert, update, delete on public.contribution_records from authenticated;
revoke insert, update, delete on public.redemptions from authenticated;
revoke insert, update, delete on public.high_fives from authenticated;
revoke insert, update, delete on public.kudos from authenticated;
grant execute on function public.create_household_with_owner(text, text, text, text, text) to authenticated;
grant execute on function public.add_managed_child(uuid, text, text, text) to authenticated;
grant execute on function public.join_quest(uuid, uuid) to authenticated;
grant execute on function public.complete_quest(uuid, uuid, text) to authenticated;
grant execute on function public.redeem_reward(uuid, uuid, text) to authenticated;
grant execute on function public.send_high_five(uuid, uuid, uuid) to authenticated;
grant execute on function public.send_kudos(uuid, uuid, text) to authenticated;
