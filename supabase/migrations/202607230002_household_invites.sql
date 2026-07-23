create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  token_hash bytea not null unique,
  created_by uuid not null references public.household_members(id) on delete restrict,
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

alter table public.household_invites enable row level security;

create policy household_invites_read on public.household_invites
for select using (public.is_household_adult(household_id));

create or replace function public.create_household_invite(
  target_household uuid,
  valid_hours integer default 72
)
returns text language plpgsql security definer set search_path = public
as $$
declare
  creator uuid;
  raw_token text;
begin
  if not public.is_household_adult(target_household) then
    raise exception 'Adult household membership required';
  end if;
  if valid_hours < 1 or valid_hours > 168 then
    raise exception 'Invite duration must be between 1 and 168 hours';
  end if;

  select id into creator
  from public.household_members
  where household_id = target_household
    and user_id = auth.uid()
    and active
    and role = 'adult';

  raw_token := encode(gen_random_bytes(24), 'hex');
  insert into public.household_invites (
    household_id,
    token_hash,
    created_by,
    expires_at
  )
  values (
    target_household,
    digest(raw_token, 'sha256'),
    creator,
    now() + make_interval(hours => valid_hours)
  );

  return raw_token;
end;
$$;

create or replace function public.accept_household_invite(
  invite_token text,
  adult_name text,
  adult_initials text,
  adult_colour text default '#3c7f9d'
)
returns table (household_id uuid, member_id uuid)
language plpgsql security definer set search_path = public
as $$
declare
  invite_row public.household_invites%rowtype;
  new_member uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select * into invite_row
  from public.household_invites
  where token_hash = digest(invite_token, 'sha256')
  for update;

  if invite_row.id is null
    or invite_row.accepted_at is not null
    or invite_row.revoked_at is not null
    or invite_row.expires_at <= now()
  then
    raise exception 'Invite unavailable';
  end if;

  if exists (
    select 1 from public.household_members
    where household_id = invite_row.household_id and user_id = auth.uid()
  ) then
    raise exception 'This account already belongs to the household';
  end if;

  insert into public.household_members (
    household_id,
    user_id,
    display_name,
    initials,
    role,
    colour,
    point_label
  )
  values (
    invite_row.household_id,
    auth.uid(),
    adult_name,
    adult_initials,
    'adult',
    adult_colour,
    'Chill Points'
  )
  returning id into new_member;

  update public.household_invites
  set accepted_by = auth.uid(), accepted_at = now()
  where id = invite_row.id;

  return query select invite_row.household_id, new_member;
end;
$$;

revoke insert, update, delete on public.household_invites from authenticated;
revoke all on function public.create_household_invite(uuid, integer) from public;
revoke all on function public.accept_household_invite(text, text, text, text) from public;
grant execute on function public.create_household_invite(uuid, integer) to authenticated;
grant execute on function public.accept_household_invite(text, text, text, text) to authenticated;

create index household_invites_household_idx
on public.household_invites (household_id, created_at desc);

