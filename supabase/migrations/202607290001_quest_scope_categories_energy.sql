create table public.quest_categories (
  household_id uuid not null references public.households(id) on delete cascade,
  id text not null check (id ~ '^[a-z0-9][a-z0-9-]{0,47}$'),
  name text not null check (char_length(name) between 1 and 60),
  scope text not null check (scope in ('home', 'personal')),
  icon text not null default 'home',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_by uuid not null references public.household_members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (household_id, id)
);

alter table public.quest_templates
  add column scope text not null default 'home'
    check (scope in ('home', 'personal')),
  add column category_id text,
  add column home_energy_value integer not null default 1
    check (home_energy_value between 0 and 100),
  add column suggested_member_ids uuid[] not null default '{}'::uuid[],
  add constraint quest_templates_category_fk
    foreign key (household_id, category_id)
    references public.quest_categories(household_id, id);

alter table public.daily_quests
  add column scope text not null default 'home'
    check (scope in ('home', 'personal')),
  add column category_id text,
  add column home_energy_value integer not null default 1
    check (home_energy_value between 0 and 100),
  add column suggested_member_ids uuid[] not null default '{}'::uuid[],
  add column creation_key text,
  add constraint daily_quests_category_fk
    foreign key (household_id, category_id)
    references public.quest_categories(household_id, id);

update public.quest_templates
set
  scope = case when kind = 'personal' then 'personal' else 'home' end,
  home_energy_value = case when kind = 'personal' then 0 else 1 end;

update public.daily_quests
set
  scope = case when kind = 'personal' then 'personal' else 'home' end,
  home_energy_value = case when kind in ('personal', 'repair') then 0 else 1 end,
  suggested_member_ids = case
    when repair_for_member_id is not null then array[repair_for_member_id]
    else suggested_member_ids
  end;

alter table public.quest_categories enable row level security;

create policy quest_categories_read on public.quest_categories
  for select using (public.is_household_member(household_id));

create policy quest_categories_write on public.quest_categories
  for all using (public.is_household_adult(household_id))
  with check (public.is_household_adult(household_id));

create index quest_categories_household_scope_idx
  on public.quest_categories (household_id, scope, sort_order)
  where active;

create index daily_quests_household_scope_idx
  on public.daily_quests (household_id, scope, due_date, state);

create unique index daily_quests_creation_key_idx
  on public.daily_quests (household_id, creation_key)
  where creation_key is not null;

create or replace function public.ensure_default_quest_categories(
  target_household uuid,
  actor_member uuid
)
returns void language plpgsql security definer set search_path = public
as $$
begin
  insert into public.quest_categories (
    household_id,
    id,
    name,
    scope,
    icon,
    sort_order,
    created_by
  )
  values
    (target_household, 'home-kitchen', 'Kitchen', 'home', 'dishes', 10, actor_member),
    (target_household, 'home-laundry', 'Laundry', 'home', 'laundry', 20, actor_member),
    (target_household, 'home-cleaning', 'Cleaning', 'home', 'home', 30, actor_member),
    (target_household, 'home-garden', 'Garden', 'home', 'plant', 40, actor_member),
    (target_household, 'home-care', 'Care', 'home', 'sparkle', 50, actor_member),
    (target_household, 'home-errands', 'Errands', 'home', 'home', 60, actor_member),
    (target_household, 'home-other', 'Other home need', 'home', 'home', 70, actor_member),
    (target_household, 'personal-learning', 'School or learning', 'personal', 'book', 110, actor_member),
    (target_household, 'personal-admin', 'Admin', 'personal', 'book', 120, actor_member),
    (target_household, 'personal-maintenance', 'Car or maintenance', 'personal', 'wood', 130, actor_member),
    (target_household, 'personal-health', 'Health', 'personal', 'sparkle', 140, actor_member),
    (target_household, 'personal-appointments', 'Appointments', 'personal', 'book', 150, actor_member),
    (target_household, 'personal-other', 'Other personal responsibility', 'personal', 'sparkle', 160, actor_member)
  on conflict (household_id, id) do nothing;
end;
$$;

do $$
declare
  household_row record;
begin
  for household_row in
    select
      household.id as household_id,
      (
        select member.id
        from public.household_members member
        where member.household_id = household.id
          and member.role = 'adult'
          and member.active
        order by member.created_at
        limit 1
      ) as actor_member
    from public.households household
  loop
    if household_row.actor_member is not null then
      perform public.ensure_default_quest_categories(
        household_row.household_id,
        household_row.actor_member
      );
    end if;
  end loop;
end;
$$;

create or replace function public.create_daily_quest(
  target_household uuid,
  target_title text,
  target_instruction text,
  target_scope text,
  target_category_id text,
  target_effort text,
  target_appreciation_value integer,
  target_icon text,
  target_suggested_member uuid,
  request_key text
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  actor_member uuid;
  quest_id uuid;
  normalized_scope text;
  normalized_category text;
  normalized_suggestions uuid[];
begin
  select id into actor_member
  from public.household_members
  where household_id = target_household
    and user_id = auth.uid()
    and role = 'adult'
    and active;

  if actor_member is null then raise exception 'Adult household membership required'; end if;
  if nullif(trim(target_title), '') is null then raise exception 'Task title is required'; end if;
  if nullif(trim(request_key), '') is null then raise exception 'Request key is required'; end if;
  if target_scope not in ('home', 'personal') then raise exception 'Task scope is invalid'; end if;
  if target_effort not in ('light', 'medium', 'substantial', 'major') then raise exception 'Task effort is invalid'; end if;
  if target_appreciation_value not between 0 and 100 then raise exception 'Task value is invalid'; end if;

  normalized_scope := target_scope;
  normalized_category := nullif(trim(target_category_id), '');
  perform public.ensure_default_quest_categories(target_household, actor_member);

  if normalized_category is not null and not exists (
    select 1
    from public.quest_categories category
    where category.household_id = target_household
      and category.id = normalized_category
      and category.scope = normalized_scope
      and category.active
  ) then
    raise exception 'Task category is unavailable';
  end if;

  if target_suggested_member is not null and not exists (
    select 1
    from public.household_members
    where id = target_suggested_member
      and household_id = target_household
      and active
  ) then
    raise exception 'Suggested family member is unavailable';
  end if;

  if normalized_scope = 'personal' and target_suggested_member is null then
    raise exception 'Personal tasks need a family member';
  end if;

  normalized_suggestions := case
    when target_suggested_member is null then '{}'::uuid[]
    else array[target_suggested_member]
  end;

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
    created_by,
    scope,
    category_id,
    home_energy_value,
    suggested_member_ids,
    creation_key
  )
  values (
    target_household,
    left(trim(target_title), 100),
    left(trim(coalesce(target_instruction, '')), 240),
    left(trim(coalesce(target_instruction, '')), 240),
    case when normalized_scope = 'personal' then 'personal'::public.quest_kind else 'open'::public.quest_kind end,
    coalesce(nullif(trim(target_icon), ''), 'home'),
    target_effort,
    target_appreciation_value,
    case when normalized_scope = 'home' then target_appreciation_value else 0 end,
    'needed',
    current_date,
    0,
    actor_member,
    normalized_scope,
    normalized_category,
    case when normalized_scope = 'home' then 1 else 0 end,
    normalized_suggestions,
    left(trim(request_key), 160)
  )
  on conflict (household_id, creation_key) where creation_key is not null
  do update set creation_key = excluded.creation_key
  returning id into quest_id;

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
    'quest_created',
    'daily_quest',
    quest_id,
    jsonb_build_object(
      'scope', normalized_scope,
      'category_id', normalized_category,
      'suggested_member_id', target_suggested_member
    )
  );

  return quest_id;
end;
$$;

alter function public.household_snapshot(uuid, uuid)
  rename to household_snapshot_without_quest_metadata;

create or replace function public.household_snapshot(
  target_household uuid,
  target_member uuid
)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare
  result jsonb;
  enriched_quests jsonb;
  categories jsonb;
begin
  result := public.household_snapshot_without_quest_metadata(target_household, target_member);

  select coalesce(jsonb_agg(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            item.value,
            '{scope}',
            to_jsonb(quest.scope),
            true
          ),
          '{categoryId}',
          coalesce(to_jsonb(quest.category_id), 'null'::jsonb),
          true
        ),
        '{homeEnergyValue}',
        to_jsonb(quest.home_energy_value),
        true
      ),
      '{suggestedMemberIds}',
      to_jsonb(quest.suggested_member_ids),
      true
    )
    order by item.ordinality
  ), '[]'::jsonb)
  into enriched_quests
  from jsonb_array_elements(result->'quests') with ordinality as item(value, ordinality)
  join public.daily_quests quest on quest.id = (item.value->>'id')::uuid;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', category.id,
    'householdId', category.household_id,
    'name', category.name,
    'scope', category.scope,
    'icon', category.icon,
    'sortOrder', category.sort_order,
    'active', category.active
  ) order by category.scope, category.sort_order, category.name), '[]'::jsonb)
  into categories
  from public.quest_categories category
  where category.household_id = target_household
    and category.active;

  result := jsonb_set(result, '{quests}', enriched_quests, true);
  return jsonb_set(result, '{questCategories}', categories, true);
end;
$$;

revoke all on function public.create_daily_quest(uuid, text, text, text, text, text, integer, text, uuid, text) from public;
revoke all on function public.ensure_default_quest_categories(uuid, uuid) from public;
revoke all on function public.ensure_default_quest_categories(uuid, uuid) from authenticated;
revoke all on function public.household_snapshot_without_quest_metadata(uuid, uuid) from public;
revoke all on function public.household_snapshot_without_quest_metadata(uuid, uuid) from authenticated;
revoke all on function public.household_snapshot(uuid, uuid) from public;

grant execute on function public.create_daily_quest(uuid, text, text, text, text, text, integer, text, uuid, text) to authenticated;
grant execute on function public.household_snapshot(uuid, uuid) to authenticated;
