alter table public.daily_quests
  add column if not exists repair_for_member_id uuid references public.household_members(id) on delete restrict;

alter table public.daily_quests
  add constraint repair_mission_target_required check (
    (kind = 'repair' and repair_for_member_id is not null and appreciation_value = 0 and contribution_value = 0)
    or (kind <> 'repair' and repair_for_member_id is null)
  );
