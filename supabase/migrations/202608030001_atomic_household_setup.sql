create or replace function public.create_household_setup(
  home_name text,
  home_timezone text,
  owner_name text,
  owner_initials text,
  child_name text,
  child_initials text,
  owner_colour text default '#ef6d5b',
  child_colour text default '#e2aa37'
)
returns table (
  household_id uuid,
  member_id uuid,
  child_member_id uuid,
  invite_token text
)
language plpgsql security definer set search_path = public, extensions
as $$
declare
  new_household uuid;
  new_owner uuid;
  new_child uuid;
  new_invite text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if nullif(trim(child_name), '') is null then raise exception 'Child name is required'; end if;

  select created.household_id, created.member_id
  into new_household, new_owner
  from public.create_household_with_owner(
    home_name,
    home_timezone,
    owner_name,
    owner_initials,
    owner_colour
  ) created;

  new_child := public.add_managed_child(
    new_household,
    child_name,
    child_initials,
    child_colour
  );

  perform public.create_daily_quest(
    new_household,
    'Dishes',
    'Clear, wash, and leave the sink ready.',
    'home',
    'home-kitchen',
    'light',
    1,
    'dishes',
    null,
    'starter:home-kitchen'
  );

  perform public.create_daily_quest(
    new_household,
    'Pack away laundry',
    'Sort the clean clothes and return them to their homes.',
    'home',
    'home-laundry',
    'light',
    1,
    'laundry',
    null,
    'starter:home-laundry'
  );

  perform public.create_daily_quest(
    new_household,
    'Water plants',
    'Check the soil and water the plants that are dry.',
    'home',
    'home-garden',
    'light',
    1,
    'plant',
    null,
    'starter:home-garden'
  );

  new_invite := public.create_household_invite(new_household, 72);

  return query select new_household, new_owner, new_child, new_invite;
end;
$$;

revoke all on function public.create_household_setup(text, text, text, text, text, text, text, text) from public;
grant execute on function public.create_household_setup(text, text, text, text, text, text, text, text) to authenticated;
