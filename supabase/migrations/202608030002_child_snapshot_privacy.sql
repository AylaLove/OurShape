-- Child profiles need the household game, not adult workload-balancing data.
-- Keep the existing snapshot as the adult source, then filter its result at
-- the database boundary whenever the requested active profile is a child.

alter function public.household_snapshot(uuid, uuid)
  rename to household_snapshot_with_adult_balance;

create or replace function public.household_snapshot(
  target_household uuid,
  target_member uuid
)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare
  member_role public.household_role;
  result jsonb;
  child_members jsonb;
  child_points jsonb;
  child_quests jsonb;
begin
  result := public.household_snapshot_with_adult_balance(target_household, target_member);

  select role into member_role
  from public.household_members
  where id = target_member
    and household_id = target_household
    and active;

  if member_role = 'child' then
    select coalesce(jsonb_agg(
      jsonb_set(member.value, '{contributionTarget}', '0'::jsonb, true)
      order by member.ordinality
    ), '[]'::jsonb)
    into child_members
    from jsonb_array_elements(result #> '{household,members}')
      with ordinality as member(value, ordinality);

    select coalesce(jsonb_agg(entry.value order by entry.ordinality), '[]'::jsonb)
    into child_points
    from jsonb_array_elements(result->'pointLedger')
      with ordinality as entry(value, ordinality)
    where entry.value->>'memberId' = target_member::text;

    select coalesce(jsonb_agg(
      jsonb_set(quest.value, '{contributionValue}', '0'::jsonb, true)
      order by quest.ordinality
    ), '[]'::jsonb)
    into child_quests
    from jsonb_array_elements(result->'quests')
      with ordinality as quest(value, ordinality);

    result := jsonb_set(result, '{household,members}', child_members, false);
    result := jsonb_set(result, '{pointLedger}', child_points, true);
    result := jsonb_set(result, '{contributionLedger}', '[]'::jsonb, true);
    result := jsonb_set(result, '{quests}', child_quests, true);
  end if;

  return result;
end;
$$;

revoke all on function public.household_snapshot_with_adult_balance(uuid, uuid) from public;
revoke all on function public.household_snapshot_with_adult_balance(uuid, uuid) from authenticated;
revoke all on function public.household_snapshot(uuid, uuid) from public;
grant execute on function public.household_snapshot(uuid, uuid) to authenticated;
