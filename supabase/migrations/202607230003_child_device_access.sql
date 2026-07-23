create table public.child_device_access (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  child_member_id uuid not null references public.household_members(id) on delete cascade,
  code_hash bytea not null unique,
  created_by uuid not null references public.household_members(id) on delete restrict,
  expires_at timestamptz not null,
  claimed_by uuid references auth.users(id) on delete cascade,
  claimed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

alter table public.child_device_access enable row level security;

create policy child_device_access_read on public.child_device_access
for select using (public.is_household_adult(household_id));

create or replace function public.is_household_member(target_household uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = target_household and user_id = auth.uid() and active
  ) or exists (
    select 1
    from public.child_device_access access
    join public.household_members child on child.id = access.child_member_id
    where access.household_id = target_household
      and access.claimed_by = auth.uid()
      and access.claimed_at is not null
      and access.revoked_at is null
      and child.active
      and child.role = 'child'
  );
$$;

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
  ) or exists (
    select 1
    from public.child_device_access access
    join public.household_members child on child.id = access.child_member_id
    where child.id = target_member
      and access.claimed_by = auth.uid()
      and access.claimed_at is not null
      and access.revoked_at is null
      and child.active
      and child.role = 'child'
  );
$$;

create or replace function public.create_child_device_code(
  target_child uuid,
  valid_minutes integer default 10
)
returns text language plpgsql security definer set search_path = public
as $$
declare
  child_row public.household_members%rowtype;
  creator uuid;
  raw_code text;
begin
  select * into child_row
  from public.household_members
  where id = target_child and active and role = 'child';

  if child_row.id is null or not public.is_household_adult(child_row.household_id) then
    raise exception 'Managed child profile unavailable';
  end if;
  if valid_minutes < 2 or valid_minutes > 30 then
    raise exception 'Device code duration must be between 2 and 30 minutes';
  end if;

  select id into creator
  from public.household_members
  where household_id = child_row.household_id
    and user_id = auth.uid()
    and active
    and role = 'adult';

  raw_code := lpad((floor(random() * 1000000))::integer::text, 6, '0');

  insert into public.child_device_access (
    household_id,
    child_member_id,
    code_hash,
    created_by,
    expires_at
  )
  values (
    child_row.household_id,
    child_row.id,
    digest(raw_code, 'sha256'),
    creator,
    now() + make_interval(mins => valid_minutes)
  );

  return raw_code;
end;
$$;

create or replace function public.claim_child_device(
  device_code text
)
returns table (household_id uuid, member_id uuid)
language plpgsql security definer set search_path = public
as $$
declare
  access_row public.child_device_access%rowtype;
begin
  if auth.uid() is null then raise exception 'Anonymous authentication required'; end if;
  if exists (select 1 from public.household_members where user_id = auth.uid()) then
    raise exception 'Adult accounts cannot become child devices';
  end if;

  select * into access_row
  from public.child_device_access
  where code_hash = digest(device_code, 'sha256')
  for update;

  if access_row.id is null
    or access_row.claimed_at is not null
    or access_row.revoked_at is not null
    or access_row.expires_at <= now()
  then
    raise exception 'Device code unavailable';
  end if;

  update public.child_device_access
  set claimed_by = auth.uid(), claimed_at = now()
  where id = access_row.id;

  return query select access_row.household_id, access_row.child_member_id;
end;
$$;

create or replace function public.revoke_child_device(
  target_access uuid
)
returns void language plpgsql security definer set search_path = public
as $$
declare
  access_household uuid;
begin
  select household_id into access_household
  from public.child_device_access
  where id = target_access;
  if access_household is null or not public.is_household_adult(access_household) then
    raise exception 'Child device access unavailable';
  end if;

  update public.child_device_access
  set revoked_at = now()
  where id = target_access and revoked_at is null;
end;
$$;

revoke insert, update, delete on public.child_device_access from authenticated;
revoke all on function public.create_child_device_code(uuid, integer) from public;
revoke all on function public.claim_child_device(text) from public;
revoke all on function public.revoke_child_device(uuid) from public;
grant execute on function public.create_child_device_code(uuid, integer) to authenticated;
grant execute on function public.claim_child_device(text) to authenticated;
grant execute on function public.revoke_child_device(uuid) to authenticated;

create index child_device_access_household_idx
on public.child_device_access (household_id, created_at desc);

